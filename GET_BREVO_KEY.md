# 🔑 Comment obtenir ta vraie clé API Brevo

## Étape 1 : Va sur Brevo
👉 https://app.brevo.com/settings/keys/api

## Étape 2 : Copie la clé API v3
- Clique sur "Create a new API key" si tu n'en as pas
- Copie la clé (commence par `xkeysib-` et fait ~68 caractères)

## Étape 3 : Remplace dans le .env
```bash
# Ouvre ton .env
nano .env

# Trouve la ligne BREVO_API_KEY et remplace par ta vraie clé
# Sauvegarde (Ctrl+O puis Ctrl+X)
```

OU en une commande (remplace YOUR_REAL_KEY) :
```bash
sed -i '' 's/BREVO_API_KEY=.*/BREVO_API_KEY=YOUR_REAL_KEY/' .env
```

## Étape 4 : Teste l'envoi
```bash
PORT=3009 node backend/server.js &
sleep 2
curl -X POST http://localhost:3009/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"ton@email.com","subject":"Test Brevo","html":"<p>✅ Ça marche</p>"}'
```

Si tu vois "✓ Email sent via Brevo to ..." → **c'est bon !**

---

## Alternative : Utiliser SMTP relay Brevo (sans API)

Si tu préfères utiliser SMTP au lieu de l'API :

1. Va sur https://app.brevo.com/settings/keys/smtp
2. Copie les credentials SMTP
3. Mets-les dans `.env` :
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=ton-email@brevo-smtp.com
SMTP_PASS=ton-mot-de-passe-smtp
SMTP_FROM=no-reply@ton-domaine.com
```

4. Supprime ou laisse vide `BREVO_API_KEY` → le code utilisera SMTP automatiquement

---

**Une fois la clé configurée, commit et push, puis configure la MÊME clé sur Render !**
