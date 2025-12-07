# 🏠 Real Estate AI — SaaS Platform

**A complete, production-ready SaaS application for real estate deal analysis with Stripe subscriptions and email alerts.**

## ⚡ What It Does

- **Signup/Login** → Create accounts with email and password
- **Payment Processing** → Stripe checkout for Premium (€14.99/mo) and Pro (€27.99/mo) subscriptions
- **Deal Analyzer** → Analyze real estate properties with advanced metrics (yield, cashflow, ROI score)
- **Alert System** → Set criteria and receive email notifications for matching properties
- **Dashboard** → View subscription status, deal history, and account details
- **Beautiful UI** → Responsive design optimized for desktop and mobile

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS |
| Backend | Node.js + Express 4.18 |
| Database | lowdb (JSON) — ready for PostgreSQL |
| Authentication | JWT tokens |
| Payments | Stripe subscriptions + webhooks |
| Email | Nodemailer (SMTP) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Create .env file
cp .env.example .env
# Fill in Stripe test keys and SMTP config

# 3. Start backend (terminal 1)
cd backend
node server.js

# 4. Start frontend (terminal 2)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Deploy to Production

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for:
- Step-by-step Render backend deployment
- Vercel frontend deployment
- Stripe webhook configuration
- Custom domain setup

---

## 📚 Documentation

- **[COMPLETION_REPORT.md](./COMPLETION_REPORT.md)** — What was built + feature checklist
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — How to deploy to production
- **[ENV.md](./ENV.md)** — Environment variable reference
- **[render.yaml](./render.yaml)** — Infrastructure as code

---

## 💳 Payment Tiers

| Plan | Price | Billing | Features |
|------|-------|---------|----------|
| **Free** | Free | - | Basic deal analysis |
| **Premium** | €14.99 | Monthly | Unlimited analyses, deal history, email support |
| | €54.99 | Yearly | Same as monthly |
| **Pro** | €27.99 | Monthly | Everything in Premium + real-time alerts, advanced analytics, priority support |
| | €99.99 | Yearly | Same as monthly |

---

## 🔐 Features

✅ User Authentication (JWT)
✅ Stripe Payment Processing
✅ Email Notifications (SMTP)
✅ Subscription Management
✅ Deal Analyzer with Score
✅ Alert System
✅ User Dashboard
✅ Webhook Handling
✅ Error Handling & Logging
✅ CORS & Security Headers
✅ bcryptjs Password Hashing
✅ Production-Ready Code

---

## 📁 Project Structure

```
real-estate-ai/
├── backend/
│   ├── server.js              # Express API + Stripe + SMTP
│   ├── data.json              # lowdb database
│   ├── Dockerfile             # Docker image for Render
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app & routing
│   │   ├── api.ts             # API client
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── PricingSection.tsx  # Pricing cards
│   │   ├── AuthPage.tsx        # Login/signup
│   │   ├── AlertsManager.tsx   # Alert UI
│   │   └── ...
│   ├── vercel.json            # Vercel config
│   └── package.json
├── DEPLOYMENT.md              # Deployment guide
├── ENV.md                     # Environment variables
├── COMPLETION_REPORT.md       # What was built
├── render.yaml                # Render config
└── .env.example               # Environment template
```

---

## 🔄 How It Works

### Signup/Login Flow
1. User fills email + password
2. Backend hashes password with bcryptjs
3. JWT token returned
4. Token stored in localStorage

### Subscription Flow
1. User clicks "Get Premium"
2. Frontend calls backend `/api/create-checkout-session`
3. Backend creates Stripe checkout session
4. User redirected to Stripe checkout
5. After payment, Stripe webhook fires
6. Backend creates subscription record
7. Welcome email sent to user
8. User sees "Active Subscription" in dashboard

### Alert Flow
1. User creates alert with criteria
2. Alert saved to lowdb
3. Backend runs interval checker (every 30 seconds)
4. When match found, email sent
5. User can unsubscribe from alert

---

## 🛠️ Configuration

All configuration via environment variables (see `.env.example`):

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRICE_PREMIUM_MONTHLY_ID=price_...
PRICE_PREMIUM_YEARLY_ID=price_...
PRICE_PRO_MONTHLY_ID=price_...
PRICE_PRO_YEARLY_ID=price_...

# Security (required)
JWT_SECRET=long-random-string

# Frontend (required)
FRONTEND_URL=https://app.yourdomain.com

# Email (optional, fallback to console log)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## ⚠️ Important Notes

1. **Never commit `.env`** — It's in `.gitignore`
2. **Use test Stripe keys** for development
3. **Switch to live keys** before going public
4. **Configure webhook** in Stripe Dashboard
5. **Test email delivery** before launch
6. **Set strong JWT_SECRET** (min 32 characters)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check syntax
node -c backend/server.js

# Check dependencies
cd backend && npm install
```

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Ensure backend is running on correct port
- Check browser console for CORS errors

### Stripe webhook not firing
- Verify webhook endpoint URL is correct
- Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
- Review webhook logs in Stripe Dashboard

### Emails not sending
- Test SMTP credentials locally
- Check spam folder
- Review backend logs for SMTP errors

---

## 📊 Monitoring & Logs

### Render Logs
```bash
# View backend logs
https://dashboard.render.com → your service → logs
```

### Vercel Logs
```bash
# View frontend logs
https://vercel.com → your project → deployments
```

### Stripe Logs
```bash
# View webhook events
https://dashboard.stripe.com → developers → webhooks
```

---

## 🎯 Next Steps

1. **Read `DEPLOYMENT.md`** for step-by-step deployment
2. **Set up Render account** and deploy backend
3. **Set up Vercel account** and deploy frontend
4. **Configure Stripe webhook** pointing to your backend
5. **Test full flow** (signup → payment → dashboard)
6. **Monitor logs** during first launches

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Express Docs:** https://expressjs.com

---

## 📜 License

This project is proprietary. All rights reserved.

---

## ✨ Status

**🟢 PRODUCTION READY**

This application is fully functional and ready for deployment. Follow `DEPLOYMENT.md` to launch.

**Built with:**
- 💪 Secure authentication
- 💳 Stripe payment processing
- 📧 SMTP email system
- 🎨 Beautiful responsive UI
- 🚀 Production-grade code
- 📚 Complete documentation

---

**Let's turn real estate deals into data insights!** 🏗️

---

*Last updated: December 7, 2025*
