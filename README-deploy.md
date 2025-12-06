# Deployment guide — Render (backend), Vercel (frontend), Stripe

This project includes a Vite + React frontend (in `/frontend`) and an Express backend (in `/backend`). Below are concise steps to deploy to Vercel (frontend) and Render (backend), plus Stripe setup notes.

Prereqs:
- GitHub repo connected to Vercel and Render (both support GitHub integration)
- Stripe account
- (Optional) SMTP provider credentials

1) Frontend — Vercel
- In Vercel, import the repository and select the `frontend/` project. Vercel will detect `package.json`.
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables (set in Vercel dashboard if needed):
  - `VITE_API_URL` (if frontend calls backend; else the code uses relative /api)
  - `NODE_ENV=production`
- The included `frontend/vercel.json` config makes the SPA routing work.

2) Backend — Render
- Create a new Web Service in Render and connect the GitHub repo.
- Choose Docker or Node service. If using Docker, the `/backend/Dockerfile` is present.
- If using Node environment, ensure build & start commands are set (no build needed):
  - Start command: `node server.js`
- Environment variables to configure on Render (secrets):
  - `PORT` (Render sets automatically)
  - `FRONTEND_URL` = your Vercel URL (e.g. `https://app.yourdomain.com`)
  - `JWT_SECRET` = long random string
  - `STRIPE_SECRET_KEY` = your Stripe secret key
  - `STRIPE_WEBHOOK_SECRET` = Stripe webhook signing secret (see below)
  - `PRICE_*` variables (Stripe Price IDs)
  - Optional SMTP vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

3) Stripe Webhook
- In Stripe Dashboard → Developers → Webhooks, create an endpoint pointing to:
  - `https://<YOUR_BACKEND_URL>/api/webhook`
- Select events: at least `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
- After creating, copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET` in Render environment.

4) GitHub & CI
- Vercel and Render will auto-deploy on push to main if connected.
- Optional: add GitHub Actions to run lint/tests before deployment.

5) Local testing
- Copy `.env.example` to `.env` in the repo root and populate values for local dev.
- Start backend:
  ```bash
  cd backend
  npm install
  node server.js
  ```
- Start frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

6) Security & Production Notes
- Use strong `JWT_SECRET`.
- Use real Stripe price IDs — do not use dev fake flows in production.
- Configure SMTP and test email delivery.
- Replace the demo alert runner with a scheduled job queue for production.

If you want, I can:
- add a Render `render.yaml` manifest for the backend (automated infra),
- add a GitHub Actions workflow to run tests/build and optionally deploy,
- or commit these files and push to a branch ready to connect to Vercel/Render.

Tell me which of the above next steps you want me to do and I’ll implement it.
