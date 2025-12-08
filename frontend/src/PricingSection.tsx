import type { FC } from "react";
import { useState } from "react";
import { startCheckout } from "./billing";

export const PricingSection: FC = () => {
  const [userPlan] = useState<string | null>(null);

  function requireAuthAndCheckout(plan: Parameters<typeof startCheckout>[0], billing: Parameters<typeof startCheckout>[1]) {
    const token = localStorage.getItem('token');
    if (!token) {
      // send user to login page
      window.history.pushState({}, '', '/login');
      window.location.reload();
      return;
    }
    void startCheckout(plan, billing);
  }

  function handleLockedFeatureClick(requiredPlan: string) {
    // If user is not subscribed or doesn't have required plan, redirect to pricing
    if (!userPlan || userPlan !== requiredPlan) {
      const plan = requiredPlan === "pro" ? "pro" : "premium";
      // Redirect to checkout
      const token = localStorage.getItem('token');
      if (!token) {
        window.history.pushState({}, '', '/login');
        window.location.reload();
        return;
      }
      void startCheckout(plan as "premium" | "pro", "month");
    }
  }
  return (
    <div className="pricing-shell">
      {/* Bloc texte centralisé */}
      <div className="pricing-copy">
        <p className="eyebrow">💰 Plans Premium • Essai gratuit illimité sans CB</p>
        <h2>Passez à la vitesse supérieure. Économisez 3h/semaine.</h2>
        <p className="pricing-subtitle">
          <strong>2 847 investisseurs</strong> utilisent nos plans Premium pour analyser plus vite, 
          économiser du temps et sécuriser leurs deals. <strong>Annulation en 1 clic. Sans engagement.</strong>
        </p>

        <p className="pricing-note">
          💡 <strong>Résultats réels</strong> : Premium = -3h/semaine d'analyse. 
          Pro = deals trouvés 48h avant la concurrence (alertes temps réel).
        </p>
        <p className="pricing-security">
          🔒 Paiement 100% sécurisé Stripe • CB • Apple Pay • Google Pay • Virement SEPA
        </p>
      </div>

      {/* Cartes d’abonnement */}
      <div className="pricing-grid">
        {/* PREMIUM */}
        <div className="plan-card plan-premium">
          <div className="plan-header">
            <span className="plan-badge">✨ Premium</span>
            <h3>Investisseurs réguliers (5-10 biens/mois)</h3>
            <p className="plan-description">
              Économisez 3h/semaine avec les calculateurs automatiques.
              Frais de gestion, garanties, impôts, prélèvements sociaux → tout est calculé pour vous.
            </p>
          </div>

          <div className="plan-prices">
            <div>
              <p className="plan-price">
                14,99<span className="price-unit">€/mois</span>
              </p>
              <p className="plan-alt">
                ou <strong>54,99 €/an</strong> – plus avantageux qu’au mois.
              </p>
            </div>
          </div>

          <ul className="plan-features">
            <li>Analyses illimitées de biens</li>
            <li>Historique & sauvegarde des deals</li>
            <li>Calculateur Frais de gestion – Mesure l'impact exact sur ta rentabilité</li>
            <li>Garantie loyer impayé – Simule le coût de couverture</li>
            <li>Taux de prélèvement à la source – Optimise tes impôts</li>
            <li>Prélèvements sociaux – Comprends chaque centime</li>
            <li>Export des chiffres (PDF / CSV bientôt)</li>
            <li>Support prioritaire par e-mail</li>
          </ul>

          <div className="plan-cta-group">
            <button
              type="button"
              className="plan-cta-primary"
              onClick={() => requireAuthAndCheckout("premium", "month")}
            >
              ⚡ Commencer maintenant – 14,99€/mois
            </button>
            <button
              type="button"
              className="plan-cta-secondary"
              onClick={() => requireAuthAndCheckout("premium", "year")}
            >
              💰 Payer annuel (économisez 27€/an)
            </button>
          </div>
        </div>

        {/* PRO */}
        <div className="plan-card plan-pro">
          <div className="plan-header">
            <span className="plan-badge badge-pro">🚀 Pro</span>
            <h3>Professionnels & courtiers (20+ biens/mois)</h3>
            <p className="plan-description">
              Trouvez les deals 48h avant la concurrence avec les alertes temps réel.
              Analyses avancées, scénarios multiples, organisation de portefeuille.
            </p>
          </div>

          <div className="plan-prices">
            <div>
              <p className="plan-price">
                27,99<span className="price-unit">€/mois</span>
              </p>
              <p className="plan-alt">
                ou <strong>99,99 €/an</strong> – pensé pour un usage intensif.
              </p>
            </div>
          </div>

          <ul className="plan-features">
            <li>Toutes les fonctionnalités Premium</li>
            <li>Alertes e-mail temps réel sur vos critères</li>
            <li className="feature-locked" onClick={() => handleLockedFeatureClick("pro")}>
              <span className="feature-blur">Scénarios avancés (apport, taux, durée…)</span>
              <span className="feature-unlock">Débloqué avec Pro</span>
            </li>
            <li className="feature-locked" onClick={() => handleLockedFeatureClick("pro")}>
              <span className="feature-blur">Tags & organisation de portefeuille</span>
              <span className="feature-unlock">Débloqué avec Pro</span>
            </li>
            <li className="feature-locked" onClick={() => handleLockedFeatureClick("pro")}>
              <span className="feature-blur">Priorité sur les prochaines fonctionnalités IA</span>
              <span className="feature-unlock">Débloqué avec Pro</span>
            </li>
          </ul>

          <div className="plan-cta-group">
            <button
              type="button"
              className="plan-cta-primary plan-cta-pro"
              onClick={() => requireAuthAndCheckout("pro", "month")}
            >
              🚀 Passer Pro maintenant – 27,99€/mois
            </button>
            <button
              type="button"
              className="plan-cta-secondary"
              onClick={() => requireAuthAndCheckout("pro", "year")}
            >
              💎 Plan annuel (économisez 235€/an)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
