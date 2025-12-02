import { useEffect, useState } from "react";

export const SuccessPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [planLabel, setPlanLabel] = useState<string>("");
  const [billingLabel, setBillingLabel] = useState<string>("");

  const goHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    async function fetchSession() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4242/api/session?session_id=${sessionId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Bad response");

        const data = await res.json();
        const s = data.session;
        const meta = s?.metadata || {};

        setPlanLabel(meta.planLabel || "");
        setBillingLabel(meta.billingLabel || "");
        setStatus("success");
      } catch (e) {
        setStatus("error");
      }
    }

    fetchSession();
  }, []);

  return (
    <div className="success-shell">
      <button
        type="button"
        className="success-back-btn"
        onClick={goHome}
      >
        ← Retour à l'analyse
      </button>

      {/* LOADING */}
      {status === "loading" && (
        <div className="chrome-card success-card">
          <div className="success-content">
            <h1 className="success-title">Validation en cours...</h1>
            <p className="success-subtitle">
              Merci de patienter quelques instants.
            </p>

            <div className="success-loader">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {status === "success" && (
        <div className="chrome-card success-card success-card-success">
          <div className="success-content">
            <div className="success-icon">✨</div>

            <h1 className="success-title">Bienvenue dans Real Estate AI! 🎉</h1>

            <p className="success-subtitle">
              Votre plan <span className="text-gradient">{planLabel}</span>
              {billingLabel && (
                <>
                  {" "}
                  <span className="success-period">({billingLabel})</span>
                </>
              )}{" "}
              est actif maintenant.
            </p>

            <p className="success-description">
              Vous avez accès illimité à toutes les analyses et fonctionnalités.
              Commencez par analyser votre prochain deal pour voir la magie en
              action.
            </p>

            <button
              onClick={goHome}
              className="primary-cta primary-chrome success-cta"
            >
              🚀 Analyser mon premier deal
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && (
        <div className="chrome-card success-card success-card-error">
          <div className="success-content">
            <div className="success-icon error-icon">⚠️</div>

            <h1 className="success-title">Erreur de validation</h1>

            <p className="success-subtitle">
              Impossible de valider votre abonnement.
            </p>

            <p className="success-description error-text">
              Vérifiez que votre session Stripe est valide ou contactez le
              support.
            </p>

            <button
              onClick={goHome}
              className="primary-cta primary-chrome success-cta"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
