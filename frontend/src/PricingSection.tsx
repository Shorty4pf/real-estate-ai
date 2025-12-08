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
        <p className="eyebrow">Plans optimisés pour gagner du temps & de l'argent</p>
        <h2>Arrête l'Excel. Maîtrise tes deals en 7 secondes.</h2>
        <p className="pricing-subtitle">
          2,847+ investisseurs nous font confiance. Essai gratuit illimité. Pas de CB requise.
          Annule à tout moment. Zéro piège.
        </p>

        <p className="pricing-note">
          💡 <strong>Astuce</strong> : Les utilisateurs Premium économisent en moyenne 3h/semaine sur l'analyse.
          Les Pro trouvent leurs deals 48h avant la concurrence grâce aux alertes.
        </p>
        <p className="pricing-security">
          🔒 Sécurisé par Stripe • Paiement en 1 clic • CB / Apple Pay / Google Pay / Virement.
        </p>
      </div>

      {/* Cartes d’abonnement */}
      <div className="pricing-grid">
        {/* PREMIUM */}
        <div className="plan-card plan-premium">
          <div className="plan-header">
            <span className="plan-badge">Premium</span>
            <h3>Pour investisseurs réguliers.</h3>
            <p className="plan-description">
              Vous analysez 5-10 biens par mois. Vous cherchez la fiabilité et
              la clarté pour chaque décision. Maîtrisez vos frais de gestion, garanties et impôts.
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
              Commencer à 14,99€/mois
            </button>
            <button
              type="button"
              className="plan-cta-secondary"
              onClick={() => requireAuthAndCheckout("premium", "year")}
            >
              Économiser 27€/an
            </button>
          </div>
        </div>

        {/* PRO */}
        <div className="plan-card plan-pro">
          <div className="plan-header">
            <span className="plan-badge badge-pro">Pro</span>
            <h3>Pour professionnels & courtiers.</h3>
            <p className="plan-description">
              Vous courrez après des biens avant la concurrence. Les alertes
              temps réel + les analyses avancées vous donnent l'avantage.
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
              Activer à 27,99€/mois
            </button>
            <button
              type="button"
              className="plan-cta-secondary"
              onClick={() => requireAuthAndCheckout("pro", "year")}
            >
              Meilleur prix : 99,99€/an
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
