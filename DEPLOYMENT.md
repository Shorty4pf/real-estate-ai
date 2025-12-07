# 🚀 Deployment Guide

This guide shows how to deploy **Real Estate AI** to production using **Vercel** (frontend) and **Render** (backend).

## Quick Summary

1. **Backend (Render):** Node.js/Express server running Stripe subscriptions, auth, and email alerts
2. **Frontend (Vercel):** React + Vite SPA for user sign up, checkout, and dashboard
3. **Payments (Stripe):** Handle subscriptions and webhooks
4. **Email (SMTP):** Send welcome, payment, and alert emails

**Estimated setup time:** 20 minutes

---

## Prerequisites

- GitHub account + this repository pushed
- Stripe account (for payment processing)
- Vercel account (free tier works)
- Render account (free tier has limited uptime)
- SMTP provider (Gmail, SendGrid, etc.) — optional

See `ENV.md` for complete environment variable reference.

---

## Deployment Steps

### 1️⃣ Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name:** `real-estate-ai-backend`
   - **Runtime:** Node
   - **Start Command:** `node backend/server.js`
   - **Region:** Closest to your users

5. Add environment variables (see `ENV.md` for full list):
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `PRICE_PREMIUM_MONTHLY_ID`, etc.
   - `JWT_SECRET` (use a long random string)
   - `FRONTEND_URL` (your Vercel domain)
   - SMTP credentials (optional)

6. Click **Create Web Service** and wait for deployment

---

### 2️⃣ Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **New Project** → Select your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build:** `npm run build`
   - **Output:** `dist`

4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://real-estate-ai-backend.onrender.com`)

5. Click **Deploy** and wait for build

---

### 3️⃣ Configure Stripe Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. **Add Endpoint**
3. URL: `https://your-render-domain/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Copy the **Signing Secret** and set it as `STRIPE_WEBHOOK_SECRET` in Render

---

## Testing

Once deployed:

1. Visit your Vercel frontend URL
2. Sign up with an email
3. Go to Pricing → select a plan
4. Use Stripe test card: `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits)
5. Verify:
   - Subscription in dashboard
   - Welcome email received
   - Backend logs show webhook success

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Render logs; ensure all required env vars are set |
| Frontend can't reach backend | Verify `VITE_API_URL` in Vercel; check CORS in backend |
| Stripe webhook not firing | Re-check signing secret; verify endpoint URL is correct |
| Emails not sending | Test SMTP creds locally; check Render logs for errors |

---

## Next Steps

- **Custom Domain:** Point your domain to Vercel frontend + Render backend
- **Monitoring:** Set up alerts in Vercel & Render dashboards
- **Upgrade:** Move from Render free tier to paid for better uptime
- **API Rate Limiting:** Add rate limiting middleware for production
- **Database:** Replace lowdb with PostgreSQL for scaling

---

**Full environment reference:** See `ENV.md`

**Status:** ✅ Production-ready. Follow steps above to deploy.
