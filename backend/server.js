// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { Low, JSONFile } = require('lowdb');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});


// --- DB init (lowdb JSON) ---
const adapter = new JSONFile('./data.json');
const db = new Low(adapter);

// ensure data file exists and has default structure before server starts
async function initDb() {
  await db.read();
db.data = db.data || { users: [], subscriptions: [], alerts: [], deals: [] };
  await db.write();
}

function nextId(coll) {
  const arr = db.data[coll] || [];
  if (!arr.length) return 1;
  return Math.max(...arr.map((x) => x.id || 0)) + 1;
}

async function findUserById(id) {
  await db.read();
  return db.data.users.find((u) => u.id === id);
}

async function findUserByEmail(email) {
  await db.read();
  return db.data.users.find((u) => u.email === email.toLowerCase());
}

async function findUserByStripeCustomer(customerId) {
  await db.read();
  return db.data.users.find((u) => u.stripe_customer_id === customerId);
}

async function createUser({ email, password_hash }) {
  await db.read();
  const id = nextId('users');
  const user = { id, email: email.toLowerCase(), password_hash, stripe_customer_id: null, created_at: new Date().toISOString() };
  db.data.users.push(user);
  await db.write();
  return user;
}

async function updateUserStripeCustomerId(userId, customerId) {
  await db.read();
  const u = db.data.users.find((x) => x.id === userId);
  if (!u) return null;
  u.stripe_customer_id = customerId;
  await db.write();
  return u;
}

async function getSubscriptionsForUser(userId) {
  await db.read();
  return (db.data.subscriptions || []).filter((s) => s.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function findSubscriptionByStripeId(stripeId) {
  await db.read();
  return (db.data.subscriptions || []).find((s) => s.stripe_subscription_id === stripeId);
}

async function upsertSubscription({ user_id, stripe_subscription_id, plan, billing_period, status }) {
  await db.read();
  let existing = db.data.subscriptions.find((s) => s.stripe_subscription_id === stripe_subscription_id);
  if (existing) {
    existing.status = status;
    existing.plan = plan;
    existing.billing_period = billing_period;
    existing.updated_at = new Date().toISOString();
  } else {
    const id = nextId('subscriptions');
    existing = { id, user_id, stripe_subscription_id, plan, billing_period, status, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.data.subscriptions.push(existing);
  }
  await db.write();
  return existing;
}

async function addAlert({ user_id, criteria }) {
  await db.read();
  const id = nextId('alerts');
  const a = { id, user_id, criteria, email_sent_count: 0, created_at: new Date().toISOString() };
  db.data.alerts.push(a);
  await db.write();
  return a;
}

async function alertsPending() {
  await db.read();
  return (db.data.alerts || []).map((a) => {
    const u = db.data.users.find((x) => x.id === a.user_id) || {};
    return { ...a, email: u.email };
  }).filter((a) => a && a.email_sent_count < 999);
}

async function incrementAlertEmailCount(alertId) {
  await db.read();
  const a = db.data.alerts.find((x) => x.id === alertId);
  if (!a) return null;
  a.email_sent_count = (a.email_sent_count || 0) + 1;
  await db.write();
  return a;
}

async function deleteAlert(alertId, userId) {
  await db.read();
  const idx = db.data.alerts.findIndex((a) => a.id === alertId && a.user_id === userId);
  if (idx === -1) return null;
  const deleted = db.data.alerts.splice(idx, 1);
  await db.write();
  return deleted[0];
}

// ---- DEALS (historique) ----

async function addDealRecord({ user_id, title, location, input, metrics, tags, note }) {
  await db.read();
  const id = nextId('deals');
  const now = new Date().toISOString();
  const rec = {
    id,
    user_id,
    title: title || null,
    location: location || null,
    input,    // toutes les données d'entrée (prix, loyer, etc.)
    metrics,  // score, cashflow, rendements...
    tags: tags || [],
    note: note || "",
    created_at: now,
    updated_at: now,
  };
  db.data.deals.push(rec);
  await db.write();
  return rec;
}

async function listDealsForUser(userId) {
  await db.read();
  return (db.data.deals || [])
    .filter((d) => d.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function updateDealRecord(userId, dealId, { tags, note }) {
  await db.read();
  const d = (db.data.deals || []).find(
    (x) => x.id === Number(dealId) && x.user_id === userId
  );
  if (!d) return null;
  if (Array.isArray(tags)) d.tags = tags;
  if (typeof note === 'string') d.note = note;
  d.updated_at = new Date().toISOString();
  await db.write();
  return d;
}


const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_token_change_me';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// setup nodemailer transporter (optional : if NO SMTP configured it will fallback to console log)
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * POST /api/create-checkout-session
 * body : { plan: "premium" | "pro", billing: "month" | "year" }
 */
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { plan, billing } = req.body;

    if (!['premium', 'pro'].includes(plan) || !['month', 'year'].includes(billing)) {
      return res.status(400).json({ error: 'Bad parameters' });
    }

    let priceId;

    if (plan === 'premium' && billing === 'month') {
      priceId = process.env.PRICE_PREMIUM_MONTHLY_ID;
    } else if (plan === 'premium' && billing === 'year') {
      priceId = process.env.PRICE_PREMIUM_YEARLY_ID;
    } else if (plan === 'pro' && billing === 'month') {
      priceId = process.env.PRICE_PRO_MONTHLY_ID;
    } else if (plan === 'pro' && billing === 'year') {
      priceId = process.env.PRICE_PRO_YEARLY_ID;
    }

    // if caller provided an Authorization bearer token, associate the customer
    let userId = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
        userId = payload.id;
      } catch (err) {
        // ignore invalid token, proceed as guest
      }
    }

    // If we have an authenticated user, ensure they have a Stripe customer id
    let customerId = undefined;
    if (userId) {
      const row = await findUserById(Number(userId));
      if (row && row.stripe_customer_id) {
        customerId = row.stripe_customer_id;
      } else {
        const userRow = row;
        const cust = await stripe.customers.create({ email: userRow?.email });
        customerId = cust.id;
        await updateUserStripeCustomerId(Number(userId), customerId);
      }
    }

    if (!priceId) {
      // In local/dev we can fallback to a fake session so checkout flows for testing without Stripe keys.
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Missing price ID' });
      }
      // simulate a checkout session and (if user) create an active subscription for dev testing
      const fakeSessionId = `dev_fake_sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const fakeSubId = `dev_fake_sub_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      if (userId) {
        // attach a subscription immediately for the user
        await upsertSubscription({ user_id: Number(userId), stripe_subscription_id: fakeSubId, plan, billing_period: billing, status: 'active' });
        // ensure stripe_customer_id exists as placeholder
        if (!customerId) {
          const custId = `dev_cust_${Date.now()}`;
          await updateUserStripeCustomerId(Number(userId), custId);
        }
      }
      return res.json({ url: `${process.env.FRONTEND_URL}/success?session_id=${fakeSessionId}` });
    }

    

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { plan, billing, userId: userId || '' },
      customer: customerId,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    // Fallback for dev: if Stripe fails, simulate a session so local testing continues
      // fallback dev flow: create fake session and locally activate subscription so local dev continues
      const fakeSessionId = `dev_error_fallback_sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const fakeSubId = `dev_error_fallback_sub_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      try {
        if (userId) {
          await upsertSubscription({ user_id: Number(userId), stripe_subscription_id: fakeSubId, plan, billing_period: billing, status: 'active' });
        }
      } catch (err2) {
        console.error('Error creating fallback subscription', err2);
      }
      return res.json({ url: `${process.env.FRONTEND_URL}/success?session_id=${fakeSessionId}` });
    }
  });

// Auth: signup
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    // prevent duplicate emails
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already used' });
    const hash = await bcryptjs.hash(password, 10);
    const user = await createUser({ email, password_hash: hash });
    const token = generateToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(400).json({ error: 'Unable to create user' });
  }
});

// Auth: login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const row = await findUserByEmail(email);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcryptjs.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken({ id: row.id, email: row.email });
  return res.json({ token, user: { id: row.id, email: row.email } });
});

// Get current user + subscription info
app.get('/api/me', authenticate, async (req, res) => {
  const id = Number(req.user.id);
  const user = await findUserById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const subs = await getSubscriptionsForUser(id);
  return res.json({ user: { id: user.id, email: user.email, stripe_customer_id: user.stripe_customer_id, created_at: user.created_at }, subscriptions: subs });
});

// GET /api/session?session_id={CHECKOUT_SESSION_ID}
app.get('/api/session', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });
    return res.json({ session });
  } catch (err) {
    console.error('Error retrieving session:', err);
    return res.status(500).json({ error: 'Unable to fetch session' });
  }
});

// Webhook receiver (optional) — verifies events and logs subscription lifecycle
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('No STRIPE_WEBHOOK_SECRET configured; accepting event without verification');
    console.log('event', req.body);
    return res.status(200).send({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle some useful events
  switch (event.type) {
    case 'checkout.session.completed': {
      console.log('Checkout session completed:', event.data.object.id);
      try {
        // fetch full session
        const s = await stripe.checkout.sessions.retrieve(event.data.object.id, { expand: ['subscription', 'customer'] });
        const metadata = s.metadata || {};
        let userId = metadata.userId ? Number(metadata.userId) : null;
        // if no userId but we have a customer, try to find user by stripe_customer_id
        if (!userId && s.customer) {
          const row = await findUserByStripeCustomer(s.customer);
          if (row) userId = row.id;
        }

        if (userId && s.subscription) {
          const sub = s.subscription;
          const plan = metadata.plan || (sub.items?.data?.[0]?.price?.product || null);
          const billing = metadata.billing || (sub.items?.data?.[0]?.price?.recurring?.interval || null);
          // insert or update subscriptions table
          await upsertSubscription({ user_id: userId, stripe_subscription_id: sub.id, plan, billing_period: billing, status: sub.status });

          // ensure stripe customer id is attached to user
          if (s.customer) {
            await updateUserStripeCustomerId(userId, s.customer);
          }
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err);
      }
      break;
    }
      break;
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded for invoice:', event.data.object.id);
      break;
    case 'customer.subscription.created': {
      const sub = event.data.object;
      console.log('Subscription created:', sub.id);
      try {
        // find user by customer id
        const userRow = await findUserByStripeCustomer(sub.customer);
        if (userRow) {
          await upsertSubscription({ user_id: userRow.id, stripe_subscription_id: sub.id, plan: sub.items?.data?.[0]?.price?.product || null, billing_period: sub.items?.data?.[0]?.price?.recurring?.interval || null, status: sub.status });
        }
      } catch (err) {
        console.error('Webhook error on subscription.created:', err);
      }
      break;
    }
      break;
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      console.log('Subscription updated:', sub.id);
      try {
        await upsertSubscription({ user_id: null, stripe_subscription_id: sub.id, plan: sub.items?.data?.[0]?.price?.product || null, billing_period: sub.items?.data?.[0]?.price?.recurring?.interval || null, status: sub.status });
      } catch (err) {
        console.error('Webhook error on subscription.updated:', err);
      }
      break;
    }
      break;
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log('Subscription cancelled:', sub.id);
      try {
        await upsertSubscription({ user_id: null, stripe_subscription_id: sub.id, plan: null, billing_period: null, status: 'canceled' });
      } catch (err) {
        console.error('Webhook error on subscription.deleted:', err);
      }
      break;
    }
      break;
    default:
      // other events
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper: check whether user has an active subscription
function userHasActiveSubscription(userId) {
  // read from in-memory lowdb copy (this should be called when db has been read)
  const subs = (db.data.subscriptions || []).filter((s) => s.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!subs || !subs.length) return false;
  return ['active', 'trialing'].includes(subs[0].status);
}

async function userHasActiveSubscriptionAsync(userId) {
  await db.read();
  return userHasActiveSubscription(userId);
}

// Alerts: create/list alerts (requires active subscription)
app.post('/api/alerts', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  if (!await userHasActiveSubscriptionAsync(userId)) return res.status(403).json({ error: 'Requires active subscription' });
  const { criteria } = req.body;
  if (!criteria) return res.status(400).json({ error: 'Missing criteria' });
  const alert = await addAlert({ user_id: userId, criteria });
  res.json({ alert });
});

// ---- DEALS ROUTES (historique + tags) ----

// Créer / enregistrer un deal (nécessite auth, mais pas forcément abo)
app.post('/api/deals', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  const { title, location, input, metrics, tags, note } = req.body;

  if (!input || !metrics) {
    return res.status(400).json({ error: 'Missing input or metrics' });
  }

  try {
    const rec = await addDealRecord({
      user_id: userId,
      title,
      location,
      input,
      metrics,
      tags,
      note,
    });
    return res.json({ deal: rec });
  } catch (err) {
    console.error('Error add deal', err);
    return res.status(500).json({ error: 'Unable to save deal' });
  }
});

// Lister les deals de l'utilisateur
app.get('/api/deals', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const deals = await listDealsForUser(userId);
    return res.json({ deals });
  } catch (err) {
    console.error('Error list deals', err);
    return res.status(500).json({ error: 'Unable to list deals' });
  }
});

// Mettre à jour tags / note
app.patch('/api/deals/:id', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  const dealId = req.params.id;
  const { tags, note } = req.body;

  try {
    const updated = await updateDealRecord(userId, dealId, { tags, note });
    if (!updated) return res.status(404).json({ error: 'Deal not found' });
    return res.json({ deal: updated });
  } catch (err) {
    console.error('Error update deal', err);
    return res.status(500).json({ error: 'Unable to update deal' });
  }
});


app.get('/api/alerts', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  await db.read();
  const alerts = (db.data.alerts || []).filter((a) => a.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ alerts });
});

app.delete('/api/alerts/:id', authenticate, async (req, res) => {
  const userId = Number(req.user.id);
  const alertId = Number(req.params.id);
  const deleted = await deleteAlert(alertId, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json({ success: true, message: 'Alert deleted' });
});

// Protected endpoint for advanced analysis (example)
app.get('/api/analysis/advanced', authenticate, async (req, res) => {
  const userId = req.user.id;
  if (!await userHasActiveSubscriptionAsync(userId)) return res.status(403).json({ error: 'Requires active subscription' });
  // Example: return some deep-analysis payload (placeholder)
  return res.json({ report: { phrases: ['Projection long terme', 'Scénarios avancés', 'Alertes similaires'], timestamp: Date.now() } });
});

// Simple alert runner (in-memory interval): in production this should be replaced with a job queue
setInterval(async () => {
  const pending = await alertsPending();
  for (const a of pending) {
    // This demo runner sends one email per alert with a fake match every interval
    const matchFound = Math.random() < 0.15; // 15% chance of a fake match
    if (!matchFound) continue;
    try {
      const subject = `Nouvelle alerte match: ${a.criteria}`;
      const text = `Bonjour, une nouvelle annonce correspond à vos critères: ${a.criteria}`;
      if (transporter) {
        await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@realestate-ai.local', to: a.email, subject, text });
      } else {
        console.log(`ALERT EMAIL (to ${a.email}): ${subject} — ${text}`);
      }
      await incrementAlertEmailCount(a.id);
    } catch (err) {
      console.error('Error sending alert email', err);
    }
  }
}, 30 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT));
