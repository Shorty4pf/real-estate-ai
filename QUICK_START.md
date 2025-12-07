# 🚀 DÉPLOIEMENT RAPIDE (20 MINUTES)

Copie-colle chaque URL dans ton navigateur et suis les étapes.

---

## 📌 PRÉREQUIS

Tu as besoin de :
- ✅ Compte GitHub (tu l'as)
- ✅ Compte Stripe (live keys - tu l'as)
- ✅ Email pour les notifications

---

## 🔴 ÉTAPE 1 : BACKEND SUR RENDER (5 MIN)

### Clique ici :
👉 **https://dashboard.render.com**

### Clique sur "Create" → "Web Service"

1. **Connect GitHub repo**
   - Sélectionne `real-estate-ai`
   - Branche: `main`

2. **Configure le service**
   ```
   Name: real-estate-ai-backend
   Region: Frankfurt (EU)
   Branch: main
   Root Directory: backend
   Build: npm install
   Start: node server.js
   ```

3. **Ajoute les variables d'environnement** (clique "Add Environment Variable")
   
   Copie-colle chaque ligne depuis ton `.env` local :
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   FRONTEND_URL=https://your-frontend-url.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   PRICE_PREMIUM_MONTHLY_ID=price_YOUR_ID_HERE
   PRICE_PREMIUM_YEARLY_ID=price_YOUR_ID_HERE
   PRICE_PRO_MONTHLY_ID=price_YOUR_ID_HERE
   PRICE_PRO_YEARLY_ID=price_YOUR_ID_HERE
   NODE_ENV=production
   ```
   
   **Elles sont dans ton fichier `.env` local !**

4. **Clique "Create Web Service"**
   - Attends 3-5 min que ça déploie
   - Copie l'URL du service (ex: `https://real-estate-ai-backend.onrender.com`)
   - **Garde cette URL, tu en auras besoin !**

---

## 🔵 ÉTAPE 2 : FRONTEND SUR VERCEL (5 MIN)

### Clique ici :
👉 **https://vercel.com**

### Clique "Add New" → "Project"

1. **Import Git Repository**
   - Sélectionne `real-estate-ai`

2. **Configure le déploiement**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Ajoute la variable d'environnement**
   - Clique "Environment Variables"
   - Ajoute :
     ```
     VITE_API_URL=https://ton-backend-render.onrender.com
     ```
     (Remplace par l'URL du backend Render que tu as copié)

4. **Clique "Deploy"**
   - Attends 2-3 min
   - Copie l'URL Vercel (ex: `https://real-estate-ai.vercel.app`)
   - **Copie cette URL également !**

---

## 🟡 ÉTAPE 3 : WEBHOOK STRIPE (3 MIN)

### Clique ici :
👉 **https://dashboard.stripe.com/webhooks**

### Ajoute un endpoint

1. **Clique "Add an endpoint"**

2. **Configure :**
   ```
   Endpoint URL: https://ton-backend-render.onrender.com/api/webhook
   ```
   (Remplace par l'URL Render du backend)

3. **Sélectionne les événements** (cocher tous les cases) :
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **Clique "Add endpoint"**

5. **Copie le "Signing secret"** (commence par `whsec_`)

6. **Ajoute dans Render**
   - Va à https://dashboard.render.com
   - Ouvre le service backend
   - Clique "Environment"
   - Ajoute :
     ```
     STRIPE_WEBHOOK_SECRET=whsec_... (le signing secret que tu as copié)
     ```
   - Clique "Save Changes"
   - Attends 1 min que ça redéploie

---

## 🟢 ÉTAPE 4 : TEST FINAL (5 MIN)

### Ouvre ton site :
👉 **Clique sur ton URL Vercel**

### Fais un test complet :

1. **Clique "Essayer gratuitement"**

2. **Signup**
   ```
   Email: test@example.com
   Password: Test1234!
   ```

3. **Va aux plans tarifaires**
   - Clique "Premium - 14.99€/mois"
   - Clique "Acheter"

4. **Paye avec la carte de test Stripe**
   ```
   Numéro: 4242 4242 4242 4242
   Expiration: 12/25
   CVC: 123
   ```

5. **Vérifie le succès**
   - Tu dois voir "Succès !" ✅
   - Vérifie que tu as reçu un email de bienvenue

6. **Connecte-toi et va au dashboard**
   - Vérifie que tu vois l'abonnement "Premium" actif ✓

---

## ✅ C'EST BON !

Si tu vois :
- ✅ Page d'accueil chargée
- ✅ Paiement accepté
- ✅ Email de bienvenue reçu
- ✅ Dashboard avec abonnement actif

**BRAVO ! Ton site est en production ! 🎉**

---

## 🆘 SI ÇA NE MARCHE PAS

### Frontend ne charge pas
- Vérifie que `VITE_API_URL` est bien configuré dans Vercel

### Paiement échoue
- Vérifie que les Stripe keys sont bonnes dans Render
- Regarde les logs Render (clique "Logs")

### Emails ne sont pas reçus
- Vérifie les credentials SMTP dans Render
- Regarde les logs pour les erreurs

### Lire les logs
- Render: https://dashboard.render.com → Clique service → "Logs"
- Vercel: https://vercel.com → Clique projet → "Deployments" → "Runtime Logs"

---

## 📞 EN CAS DE PROBLÈME

- Lis `DEPLOYMENT.md` pour le guide détaillé
- Lis `ENV.md` pour référence des variables
- Regarde les logs (Render et Vercel)

**C'est tout ! Ton SaaS est en ligne ! 🚀**
