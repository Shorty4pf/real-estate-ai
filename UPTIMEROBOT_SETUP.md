# Configuration UptimeRobot pour 100% Uptime

## Pourquoi ?
Le backend Render (gratuit) se met en veille après 15 minutes d'inactivité.
Au réveil, il faut 50 secondes → **mauvaise expérience utilisateur**.

UptimeRobot ping automatiquement ton backend toutes les 5 minutes = **toujours réveillé** = **0 secondes d'attente**.

## Installation (2 minutes)

### 1. Créer un compte UptimeRobot
- Va sur https://uptimerobot.com
- Clique "Sign Up" (gratuit, pas de CB)
- Confirme ton email

### 2. Ajouter un monitor
- Clique "+ Add New Monitor"
- **Monitor Type**: HTTP(s)
- **Friendly Name**: Real Estate AI Backend
- **URL**: `https://real-estate-ai-backend-cy09.onrender.com/api/health`
- **Monitoring Interval**: 5 minutes (max gratuit)
- Clique "Create Monitor"

### 3. C'est tout ! 🎉

Ton backend sera pingé toutes les 5 minutes.
Il ne se mettra JAMAIS en veille.
Connexion instantanée à chaque fois.

## Vérification
Après 1 heure, retourne sur ton site → connexion instantanée ✅

## Bonus : Recevoir des alertes
Dans UptimeRobot, tu peux ajouter ton email pour être alerté si le backend tombe.
