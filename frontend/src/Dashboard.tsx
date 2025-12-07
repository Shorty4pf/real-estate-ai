import type { FC } from "react";

interface Subscription {
  id: number;
  user_id: number;
  stripe_subscription_id: string;
  plan: string;
  billing_period: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DashboardProps {
  user: { id: number; email: string; stripe_customer_id: string | null; created_at: string } | null;
  subscriptions: Subscription[];
  onLogout: () => void;
}

export const Dashboard: FC<DashboardProps> = ({ user, subscriptions, onLogout }) => {
  const activeSubscription = subscriptions?.find((s) => ["active", "trialing"].includes(s.status));

  const planDetails: Record<string, { label: string; color: string; icon: string }> = {
    premium: { label: "Premium", color: "#667eea", icon: "⭐" },
    pro: { label: "Pro", color: "#764ba2", icon: "🚀" },
  };

  const getPlanInfo = (plan: string | null) => {
    return planDetails[plan || ""] || { label: "Gratuit", color: "#6c757d", icon: "📦" };
  };

  const billingLabel = activeSubscription?.billing_period === "month" ? "Mensuel" : "Annuel";
  const planInfo = activeSubscription ? getPlanInfo(activeSubscription.plan) : null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏠 Tableau de bord</h1>
        <button className="logout-btn" onClick={onLogout}>
          Se déconnecter
        </button>
      </div>

      <div className="dashboard-card user-info">
        <div className="user-header">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h2>{user?.email}</h2>
            <p className="user-created">
              Compte créé le {new Date(user?.created_at || "").toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {activeSubscription ? (
        <div className="dashboard-card subscription-info">
          <div className="subscription-header">
            <span className="plan-badge" style={{ backgroundColor: planInfo!.color }}>
              {planInfo!.icon} {planInfo!.label} {billingLabel}
            </span>
          </div>
          <div className="subscription-details">
            <p>
              <strong>Statut:</strong>{" "}
              <span
                className={`status-badge status-${activeSubscription.status}`}
              >
                {activeSubscription.status === "active" ? "✓ Actif" : "Essai"}
              </span>
            </p>
            <p>
              <strong>Période de facturation:</strong> {billingLabel}
            </p>
            <p>
              <strong>Abonnement ID:</strong>{" "}
              <code style={{ fontSize: "12px", backgroundColor: "#f0f0f0", padding: "2px 5px", borderRadius: "3px" }}>
                {activeSubscription.stripe_subscription_id}
              </code>
            </p>
            <p>
              <strong>Date d'activation:</strong>{" "}
              {new Date(activeSubscription.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="subscription-features">
            <h3>Fonctionnalités déverrouillées</h3>
            <ul>
              {activeSubscription.plan === "premium" && (
                <>
                  <li>✓ Analyses illimitées</li>
                  <li>✓ Historique des deals</li>
                  <li>✓ Exports en PDF/CSV</li>
                  <li>✓ Support par email</li>
                </>
              )}
              {activeSubscription.plan === "pro" && (
                <>
                  <li>✓ Tout de Premium</li>
                  <li>✓ Alertes temps réel</li>
                  <li>✓ Analyses avancées</li>
                  <li>✓ Support prioritaire 24/7</li>
                  <li>✓ API access</li>
                </>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="dashboard-card no-subscription">
          <p>Vous n'avez pas d'abonnement actif.</p>
          <a href="#pricing" className="cta-button">
            Découvrir les plans
          </a>
        </div>
      )}

      <div className="dashboard-card account-actions">
        <h3>Gestion du compte</h3>
        <div className="action-buttons">
          <button className="action-btn secondary">Modifier le mot de passe</button>
          <button className="action-btn secondary">Gérer les alertes</button>
          <button className="action-btn secondary">Historique des paiements</button>
          <button className="action-btn danger">Supprimer le compte</button>
        </div>
      </div>

      <style>{`
        .dashboard {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 32px;
        }

        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        .dashboard-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }

        .user-details h2 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }

        .user-created {
          margin: 0;
          color: #888;
          font-size: 14px;
        }

        .subscription-header {
          margin-bottom: 20px;
        }

        .subscription-details {
          margin-bottom: 20px;
        }

        .subscription-details p {
          margin: 12px 0;
          color: #333;
        }

        .subscription-details code {
          font-family: "Courier New", monospace;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .status-active {
          background: #d4edda;
          color: #155724;
        }

        .status-trialing {
          background: #fff3cd;
          color: #856404;
        }

        .subscription-features {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
        }

        .subscription-features h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .subscription-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .subscription-features li {
          font-size: 14px;
          color: #555;
        }

        .no-subscription {
          text-align: center;
          padding: 40px 20px;
        }

        .no-subscription p {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
        }

        .cta-button:hover {
          opacity: 0.9;
        }

        .account-actions h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .action-btn {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .action-btn.secondary {
          background: white;
          color: #333;
        }

        .action-btn.secondary:hover {
          background: #f0f0f0;
          border-color: #999;
        }

        .action-btn.danger {
          background: #fff5f5;
          color: #dc3545;
          border-color: #f5c6cb;
        }

        .action-btn.danger:hover {
          background: #f8d7da;
        }
      `}</style>
    </div>
  );
};
