// frontend/src/App.tsx
import { useState, useEffect } from "react";
import { PricingSection } from "./PricingSection";
import { AuthPage } from "./AuthPage";
import { SuccessPage } from "./SuccessPage";
import { LegalPages } from "./LegalPages";
import { AlertsManager } from "./AlertsManager";
import { API_BASE_URL } from "./config";
import Logo from "./Logo";
import {
  grossYield,
  netYield,
  monthlyCashflow,
  dealScore,
} from "./dealCalculator";
import type { DealInput } from "./dealCalculator";

function verdictFromScore(score: number): string {
  if (score >= 85)
    return "Excellent deal, rare à trouver. À sécuriser rapidement.";
  if (score >= 70) return "Bon deal, intéressant pour du long terme.";
  if (score >= 55)
    return "Correct mais optimisable (prix, charges ou financement).";
  if (score >= 40) return "Deal fragile, à analyser plus en profondeur.";
  return "Deal à éviter dans l’état actuel des chiffres.";
}

// Helper functions to check subscription plans
function hasActivePremium(me: typeof initialMe): boolean {
  return me?.subscriptions?.some(
    (sub) => ['active', 'trialing'].includes(sub.status) && sub.plan === 'premium'
  ) || false;
}

function hasActivePro(me: typeof initialMe): boolean {
  return me?.subscriptions?.some(
    (sub) => ['active', 'trialing'].includes(sub.status) && sub.plan === 'pro'
  ) || false;
}

const initialMe: { 
  user?: { id: number; email: string; stripe_customer_id: string | null; created_at: string }; 
  subscriptions?: Array<{ id: number; user_id: number; stripe_subscription_id: string; plan: string; billing_period: string; status: string; created_at: string; updated_at: string }>
} | null = null;

export default function App() {
  const [data, setData] = useState<DealInput>({
    purchasePrice: 0,
    rentMonthly: 0,
    chargesMonthly: 0,
    taxeFonciereYearly: 0,
    interestRate: 3,
    durationYears: 20,
    downPayment: 0,
  });

  // Affichage des résultats du deal
  const [showResults, setShowResults] = useState(false);

  // Token JWT stocké dans localStorage
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });

  // Données utilisateur retournées par /api/me
  const [me, setMe] = useState<{ 
    user?: { id: number; email: string; stripe_customer_id: string | null; created_at: string }; 
    subscriptions?: Array<{ id: number; user_id: number; stripe_subscription_id: string; plan: string; billing_period: string; status: string; created_at: string; updated_at: string }>
  } | null>(
    null
  );

  // Historique des deals enregistrés par l’utilisateur
  const [savedDeals, setSavedDeals] = useState<
    {
      id: number;
      title?: string | null;
      score: number;
      cashflow: number;
      created_at?: string | null;
    }[]
  >([]);

  // Simple client-side route handler pour Stripe redirects + auth
  const [routePath, setRoutePath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  // État pour les pages légales
  const [legalPage, setLegalPage] = useState<'cgu' | 'privacy' | 'cookies' | 'mentions' | null>(null);

  // Keep backend awake on Render free tier
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      } catch (err) {
        // Silently fail - just trying to keep it awake
      }
    };

    // Ping every 10 minutes
    const interval = setInterval(keepAlive, 10 * 60 * 1000);
    // Also ping immediately on load
    keepAlive();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadMe() {
      const t = token || localStorage.getItem("token");
      if (!t) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.ok) {
          const json = await res.json();
          setMe(json);
        } else {
          // invalid token
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        console.error("Unable to fetch /api/me", err);
      }
    }

    loadMe();

    function onPop() {
      setRoutePath(window.location.pathname);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [token]);

  const gYield = grossYield(data);
  const nYield = netYield(data);
  const cashflow = monthlyCashflow(data);
  const score = dealScore(data);
  const verdict = verdictFromScore(score);

  function update(field: keyof DealInput, value: number) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAnalyze() {
    if (!data.purchasePrice || !data.rentMonthly) {
      alert("Indique au minimum le prix d’achat et le loyer mensuel.");
      return;
    }
    setShowResults(true);
    scrollToId("analyzer");
  }

  async function saveCurrentDeal() {
    const t = token || localStorage.getItem("token");
    if (!t) {
      alert("Connecte-toi pour enregistrer tes deals.");
      return;
    }

    const payload = {
      title: null,
      location: null,
      input: data,
      metrics: {
        score,
        cashflow,
        grossYield: gYield,
        netYield: nYield,
        verdict,
      },
      tags: [],
      note: "",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Impossible d’enregistrer le deal.");
        return;
      }

      const json = await res.json();
      const d = json.deal;

      setSavedDeals((prev) => [
        {
          id: d.id,
          title: d.title,
          score: d.metrics.score,
          cashflow: d.metrics.cashflow,
          created_at: d.created_at,
        },
        ...prev,
      ]);

      alert("Deal enregistré !");
    } catch (e) {
      console.error(e);
      alert("Erreur réseau pendant l’enregistrement.");
    }
  }

  // --- Routes frontend (success / cancel / login / signup) ---

  if (routePath === "/success") {
    return <SuccessPage />;
  }

  if (routePath === "/cancel") {
    return (
      <div className="success-shell">
        <button
          type="button"
          className="success-back-btn"
          onClick={() => {
            window.history.pushState({}, "", "/");
            setRoutePath("/");
          }}
        >
          ← Retour à l'analyse
        </button>
        <div className="chrome-card success-card">
          <div className="success-content">
            <div className="success-icon">⚠️</div>
            <h1 className="success-title">Abonnement annulé</h1>
            <p className="success-subtitle">
              Tu as annulé le paiement. Aucun changement n'a été appliqué à ton compte.
            </p>
            <button
              className="primary-cta primary-chrome success-cta"
              onClick={() => {
                window.history.pushState({}, "", "/");
                setRoutePath("/");
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (routePath === "/login" || routePath === "/signup") {
    return <AuthPage />;
  }

  if (routePath === "/alerts") {
    if (!token) {
      return <AuthPage />;
    }
    
    // Vérifier que l'utilisateur a un abonnement Pro (les alertes sont réservées au plan Pro)
    if (!hasActivePro(me)) {
      return (
        <div className="site">
          <header className="nav nav-chrome">
            <Logo />
            <div className="nav-links">
              <button className="nav-link" onClick={() => setRoutePath("/")}>
                ← Retour à l'accueil
              </button>
            </div>
            <div className="nav-right">
              <span className="nav-login">{me?.user?.email}</span>
              <button
                className="nav-cta"
                onClick={() => {
                  localStorage.removeItem("token");
                  setToken(null);
                  setRoutePath("/");
                }}
              >
                Déconnexion
              </button>
            </div>
          </header>
          <div className="success-shell">
            <div className="chrome-card success-card">
              <div className="success-content">
                <div className="success-icon"></div>
                <h1 className="success-title">Accès Réservé au Plan Pro</h1>
                <p className="success-subtitle">
                  Les alertes immobilières en temps réel sont exclusives au plan Pro.
                  {hasActivePremium(me) && " Passez au plan Pro pour débloquer cette fonctionnalité."}
                </p>
                <button
                  className="primary-cta primary-chrome success-cta"
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    setRoutePath("/");
                  }}
                >
                  Voir le plan Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="site">
        <header className="nav nav-chrome">
          <Logo />
          <div className="nav-links">
            <button className="nav-link" onClick={() => setRoutePath("/")}>
              ← Retour à l'accueil
            </button>
          </div>
          <div className="nav-right">
            <span className="nav-login">{me?.user?.email}</span>
            <button
              className="nav-cta"
              onClick={() => {
                localStorage.removeItem("token");
                setToken(null);
                setRoutePath("/");
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>
        <AlertsManager token={token} />
      </div>
    );
  }


  if (routePath === "/cancel") {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-badge">Real Estate AI</div>
          <h1 className="auth-title">Abonnement annulé</h1>
          <p className="auth-subtitle">
            Tu as annulé le paiement. Aucun changement n’a été appliqué à ton
            compte.
          </p>
          <p className="auth-subtitle" style={{ marginTop: 12 }}>
            Retourne à la page d’accueil et réessaie si nécessaire.
          </p>
          <button
            className="auth-submit"
            onClick={() => {
              window.history.pushState({}, "", "/");
              setRoutePath("/");
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // --- Vue principale ---

  return (
    <div className="site">
      {/* NAVBAR ULTRA CHROME */}
      <header className="nav nav-chrome">
        <Logo />

        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollToId("how")}>
            Comment ça marche
          </button>
          <button className="nav-link" onClick={() => scrollToId("analyzer")}>
            Analyseur
          </button>
          <button className="nav-link" onClick={() => scrollToId("pricing")}>
            Tarifs
          </button>
          <button className="nav-link" onClick={() => scrollToId("faq")}>
            FAQ
          </button>
        </div>

        <div className="nav-right">
          {me?.user ? (
            <>
              {hasActivePro(me) && (
                <button
                  className="nav-link"
                  onClick={() => {
                    window.history.pushState({}, "", "/alerts");
                    setRoutePath("/alerts");
                  }}
                >
                  🔔 Alertes Pro
                </button>
              )}
              <button
                className="nav-link"
                onClick={() => {
                  window.history.pushState({}, "", "/");
                  setRoutePath("/");
                }}
              >
                {me.user.email}
              </button>
              <button
                className="nav-link nav-login"
                onClick={() => {
                  localStorage.removeItem("token");
                  setToken(null);
                  setMe(null);
                  window.location.reload();
                }}
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <button
              className="nav-link nav-login"
              onClick={() => {
                window.history.pushState({}, "", "/login");
                setRoutePath("/login");
              }}
            >
              Se connecter
            </button>
          )}
          <button className="nav-cta" onClick={() => scrollToId("analyzer")}>
            Essayer gratuitement →
          </button>
        </div>
      </header>

      {/* CONTENU */}
      <main>
        {/* HERO */}
        <section className="hero hero-chrome">
          <div className="hero-grid">
            {/* LEFT */}
            <div className="hero-left">
              <p className="eyebrow">C’est ton annonce qui te contacte.</p>
              <h1>
                Tes deals immo filtrés{" "}
                <span className="text-gradient">avant même la visite.</span>
              </h1>

              <p className="hero-subtitle">
                Analysez un bien en 7 secondes. Real Estate AI calcule votre
                rendement réel, cashflow mensuel et score d'investissement (0-100).
                Plus d'Excel, plus de doutes. Juste des chiffres clairs pour
                sécuriser vos décisions. Gratuit. Illimité. Pas de CB requise.
              </p>

              <div className="hero-cta-row">
                <button
                  className="primary-cta primary-chrome"
                  onClick={() => scrollToId("analyzer")}
                  style={{ fontSize: "1.05rem", padding: "0.9rem 2rem" }}
                >
                  Analyser gratuitement maintenant
                </button>
                <button
                  className="secondary-ghost"
                  onClick={() => scrollToId("pricing")}
                >
                  Plans Premium dès 14,99€ →
                </button>
              </div>

              <div className="hero-kpis">
                <div className="kpi-card kpi-chrome">
                  <p className="kpi-label">👥 Investisseurs actifs</p>
                  <p className="kpi-value">2 847+</p>
                </div>
                <div className="kpi-card kpi-chrome">
                  <p className="kpi-label">Vitesse d'analyse</p>
                  <p className="kpi-value">7 sec</p>
                </div>
                <div className="kpi-card kpi-chrome">
                  <p className="kpi-label">Économie moyenne</p>
                  <p className="kpi-value">3h/sem</p>
                </div>
              </div>
            </div>

            {/* RIGHT : MOCKUP / STORY IMMOBILIÈRE */}
            <div className="hero-right">
              <div className="chrome-card mockup-card">
                <p className="mockup-title">Deal trouvé hier – T2 • Bordeaux</p>
                <div className="mockup-body">
                  <div className="mockup-row">
                    <span>Prix d'achat</span>
                    <span className="mockup-number">189 000 €</span>
                  </div>
                  <div className="mockup-row">
                    <span>Loyer mensuel</span>
                    <span className="mockup-number">850 €/mois</span>
                  </div>
                  <div className="mockup-row" style={{ borderTop: "1px solid rgba(68, 255, 210, 0.2)", paddingTop: "0.8rem", marginTop: "0.8rem" }}>
                    <span><strong>Score global IA</strong></span>
                    <span className="mockup-number" style={{ color: "#44ffd2", fontSize: "1.3rem" }}>87/100</span>
                  </div>
                  <div className="mockup-row">
                    <span>Cashflow mensuel</span>
                    <span className="mockup-number" style={{ color: "#44ffd2" }}>+214 €</span>
                  </div>
                  <div className="mockup-row">
                    <span>Rendement net</span>
                    <span className="mockup-number">8,4%</span>
                  </div>
                  <div className="mockup-row">
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Verdict</span>
                    <span style={{ fontSize: "0.85rem", color: "#44ffd2" }}>Excellent deal ✓</span>
                  </div>

                  <button
                    className="mockup-cta"
                    onClick={() => scrollToId("analyzer")}
                    style={{ marginTop: "1rem" }}
                  >
                    Analyser votre bien maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION HOW IT WORKS */}
        <section id="how" className="section section-chrome">
          <div className="section-header">
            <p className="eyebrow">Deal Analyzer • Beta privée</p>
            <h2>En 10 secondes, vois si un bien mérite ton argent.</h2>
            <p className="hero-subtitle">
              Entre les chiffres réels du bien, Real Estate AI calcule
              instantanément le rendement, le cashflow et un score clair de 0 à
              100.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-badge">1</div>
              <h3>Colle les chiffres du bien</h3>
              <p>
                Prix, loyer, charges, taxe foncière, apport… l’IA se cale sur
                ton scénario réel, pas un exemple théorique.
              </p>
            </div>
            <div className="step-card">
              <div className="step-badge">2</div>
              <h3>Scoring instantané</h3>
              <p>
                Rendement brut & net, cashflow, score global sur 100 et lecture
                automatique du deal.
              </p>
            </div>
            <div className="step-card">
              <div className="step-badge">3</div>
              <h3>Décision claire</h3>
              <p>
                Tu vois en un coup d’œil si tu visites, si tu négocies… ou si tu
                passes au deal suivant.
              </p>
            </div>
          </div>
        </section>

        {/* ANALYSEUR */}
        <section id="analyzer" className="section section-analyzer">
          <div className="analyzer-grid">
            {/* Résumé à gauche */}
            <div className="analyzer-summary">
              <div className="chrome-card summary-card">
                <p className="eyebrow">Analyse IA du deal</p>
                <h2>Vue d’ensemble du bien</h2>
                {showResults ? (
                  <>
                    <p className="hero-subtitle">
                      Voici comment se positionne ton bien selon les chiffres
                      que tu as entrés.
                    </p>
                    <div className="summary-metrics">
                      <div>
                        <p className="kpi-label">Score global</p>
                        <p className="metric-score">{score} / 100</p>
                      </div>
                      <div>
                        <p className="kpi-label">Cashflow mensuel</p>
                        <p className="metric-score">
                          {cashflow.toFixed(0)} €
                        </p>
                      </div>
                      <div>
                        <p className="kpi-label">Rendement brut</p>
                        <p className="kpi-value">{gYield.toFixed(2)} %</p>
                      </div>
                      <div>
                        <p className="kpi-label">Rendement net</p>
                        <p className="kpi-value">{nYield.toFixed(2)} %</p>
                      </div>
                    </div>
                    <div style={{ marginTop: "1.2rem" }}>
                      <p className="kpi-label">Lecture rapide</p>
                      <p>{verdict}</p>
                    </div>

                    {/* PREMIUM SECTION - Only for Premium & Pro subscribers */}
                    {(hasActivePremium(me) || hasActivePro(me)) ? (
                      <div 
                        style={{ 
                          marginTop: "1.4rem", 
                          padding: "1.1rem", 
                          borderRadius: "0.9rem", 
                          background: "rgba(68, 255, 210, 0.08)", 
                          border: "1px solid rgba(68, 255, 210, 0.2)"
                        }}
                      >
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#44ffd2", margin: "0 0 0.8rem 0" }}>
                          Analyse Premium détaillée
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", fontSize: "0.9rem" }}>
                          <div>
                            <p style={{ color: "#a3a7b8", margin: 0 }}>Frais de gestion annuels</p>
                            <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                              {Math.round(data.rentMonthly * 12 * 0.08)} €
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#a3a7b8", margin: 0 }}>Garantie loyer impayé annuelle</p>
                            <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                              {Math.round(data.rentMonthly * 12 * 0.008)} €
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#a3a7b8", margin: 0 }}>Prélèvement à la source annuel (18%)</p>
                            <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                              {Math.round(data.rentMonthly * 12 * 0.18)} €
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#a3a7b8", margin: 0 }}>Prélèvements sociaux annuels (17.2%)</p>
                            <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                              {Math.round(data.rentMonthly * 12 * 0.172)} €
                            </p>
                          </div>
                        </div>
                        <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid rgba(68, 255, 210, 0.15)" }}>
                          <p style={{ color: "#a3a7b8", margin: 0, fontSize: "0.85rem" }}>Total frais & impôts annuels estimés</p>
                          <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.2rem 0 0", color: "#44ffd2" }}>
                            {Math.round(data.rentMonthly * 12 * (0.08 + 0.008 + 0.18 + 0.172))} €
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="premium-locked-section"
                        onClick={() => scrollToId("pricing")}
                        style={{ 
                          marginTop: "1.4rem", 
                          padding: "1.1rem", 
                          borderRadius: "0.9rem", 
                          background: "rgba(68, 255, 210, 0.08)", 
                          border: "1px solid rgba(68, 255, 210, 0.2)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div className="premium-blur-content" style={{ filter: "blur(4px)", pointerEvents: "none" }}>
                          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#44ffd2", margin: "0 0 0.8rem 0" }}>
                            Analyse Premium détaillée
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", fontSize: "0.9rem" }}>
                            <div>
                              <p style={{ color: "#a3a7b8", margin: 0 }}>Frais de gestion annuels</p>
                              <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                                972 €
                              </p>
                            </div>
                            <div>
                              <p style={{ color: "#a3a7b8", margin: 0 }}>Garantie loyer impayé annuelle</p>
                              <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                                96 €
                              </p>
                            </div>
                            <div>
                              <p style={{ color: "#a3a7b8", margin: 0 }}>Prélèvement à la source annuel</p>
                              <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                                2160 €
                              </p>
                            </div>
                            <div>
                              <p style={{ color: "#a3a7b8", margin: 0 }}>Prélèvements sociaux annuels</p>
                              <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "0.2rem 0 0", color: "#f5f5f7" }}>
                                972 €
                              </p>
                            </div>
                          </div>
                          <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid rgba(68, 255, 210, 0.15)" }}>
                            <p style={{ color: "#a3a7b8", margin: 0, fontSize: "0.85rem" }}>Total frais annuels</p>
                            <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.2rem 0 0", color: "#44ffd2" }}>
                              4200 €
                            </p>
                          </div>
                        </div>
                        <div style={{ 
                          position: "absolute", 
                          top: "50%", 
                          left: "50%", 
                          transform: "translate(-50%, -50%)",
                          background: "rgba(68, 255, 210, 0.95)",
                          color: "#050509",
                          padding: "0.7rem 1.4rem",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          boxShadow: "0 8px 24px rgba(68, 255, 210, 0.4)"
                        }}>
                          Débloqué avec Premium
                        </div>
                      </div>
                    )}

                    {/* Bouton d'enregistrement */}
                    <button
                      className="secondary-ghost"
                      style={{ marginTop: "1rem" }}
                      onClick={saveCurrentDeal}
                    >
                      Enregistrer ce deal
                    </button>

                    {/* Mini historique des deals */}
                    {savedDeals.length > 0 && (
                      <div
                        className="chrome-card summary-card"
                        style={{ marginTop: "1.5rem" }}
                      >
                        <h3>Derniers deals enregistrés</h3>
                        <ul
                          style={{
                            marginTop: "0.5rem",
                            paddingLeft: "1rem",
                          }}
                        >
                          {savedDeals.slice(0, 5).map((d) => (
                            <li
                              key={d.id}
                              style={{
                                fontSize: "0.9rem",
                                marginBottom: "0.4rem",
                              }}
                            >
                              <strong>{d.score} / 100</strong> — {d.cashflow} €
                              /mois
                              {d.created_at && (
                                <span style={{ opacity: 0.6 }}>
                                  {" · " +
                                    new Date(
                                      d.created_at
                                    ).toLocaleDateString()}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ADVANCED ANALYSIS - Only for Pro subscribers */}
                    {hasActivePro(me) ? (
                      <div 
                        style={{ 
                          marginTop: "1.3rem", 
                          padding: "1.1rem", 
                          borderRadius: "1rem", 
                          border: "1px solid rgba(68, 255, 210, 0.3)",
                          background: "radial-gradient(circle at top left, rgba(68, 255, 210, 0.15), rgba(5, 5, 12, 0.98))",
                          boxShadow: "0 18px 40px rgba(68, 255, 210, 0.2)"
                        }}
                      >
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "#44ffd2" }}>
                          Analyses avancées Pro
                        </p>
                        <div style={{ fontSize: "0.85rem", color: "#f5f5f7", lineHeight: "1.5" }}>
                          <p style={{ margin: "0.3rem 0" }}>• Scénarios financiers : apport variable, taux négociés, durées multiples</p>
                          <p style={{ margin: "0.3rem 0" }}>• Projections cashflow sur 10 ans avec inflation</p>
                          <p style={{ margin: "0.3rem 0" }}>• Optimisation fiscale LMNP vs location nue</p>
                          <p style={{ margin: "0.3rem 0" }}>• Comparaison multi-biens côte à côte</p>
                        </div>
                        <button
                          className="secondary-ghost"
                          style={{ marginTop: "0.8rem", width: "100%" }}
                          onClick={() => alert("Fonctionnalité en développement - disponible Q1 2026")}
                        >
                          Lancer une analyse avancée
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={{ 
                          marginTop: "1.3rem", 
                          padding: "1.4rem", 
                          borderRadius: "1rem", 
                          border: "2px solid rgba(68, 255, 210, 0.3)",
                          background: "linear-gradient(135deg, rgba(68, 255, 210, 0.08), rgba(5, 5, 12, 0.95))",
                          boxShadow: "0 8px 24px rgba(68, 255, 210, 0.15)"
                        }}
                      >
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                          <span style={{
                            display: "inline-block",
                            background: "linear-gradient(135deg, #44ffd2, #3ecfb8)",
                            color: "#050509",
                            padding: "0.5rem 1.2rem",
                            borderRadius: "999px",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            boxShadow: "0 4px 12px rgba(68, 255, 210, 0.3)"
                          }}>
                            Réservé au plan Pro
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 0.8rem 0", color: "#f5f5f7", textAlign: "center" }}>
                            Débloquez les analyses avancées
                          </p>
                          <div style={{ fontSize: "0.88rem", color: "#d1d5e0", lineHeight: "1.6" }}>
                            <p style={{ margin: "0.5rem 0", display: "flex", alignItems: "center" }}>
                              <span style={{ marginRight: "0.5rem", color: "#44ffd2" }}>✓</span>
                              Scénarios financiers avancés avec projections 10 ans
                            </p>
                            <p style={{ margin: "0.5rem 0", display: "flex", alignItems: "center" }}>
                              <span style={{ marginRight: "0.5rem", color: "#44ffd2" }}>✓</span>
                              Alertes temps réel sur les nouveaux biens rentables
                            </p>
                            <p style={{ margin: "0.5rem 0", display: "flex", alignItems: "center" }}>
                              <span style={{ marginRight: "0.5rem", color: "#44ffd2" }}>✓</span>
                              Optimisation fiscale et comparaison multi-biens
                            </p>
                            <p style={{ margin: "0.5rem 0", display: "flex", alignItems: "center" }}>
                              <span style={{ marginRight: "0.5rem", color: "#44ffd2" }}>✓</span>
                              Tags & organisation de portefeuille
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="hero-subtitle">
                      Lance une première analyse pour voir en temps réel le
                      score, le cashflow et le rendement de ton prochain
                      investissement.
                    </p>
                    <ul style={{ marginTop: "1rem", paddingLeft: "1.1rem" }}>
                      <li>Rendement brut & net calculés automatiquement</li>
                      <li>
                        Cashflow après charges & crédit, mois par mois
                      </li>
                      <li>Score global pour décider en un coup d’œil</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Formulaire à droite */}
            <div>
              <div className="chrome-card form-card">
                <p className="form-title">Analyse Gratuite Instantanée</p>
                <p className="form-caption">
                  Entrez les chiffres de votre bien. Résultat en 7 secondes. 100% gratuit.
                </p>

                <label>Prix d’achat (€)</label>
                <input
                  type="number"
                  placeholder="ex : 189000"
                  onChange={(e) =>
                    update("purchasePrice", Number(e.target.value))
                  }
                />

                <label>Loyer mensuel (€)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ex : 850"
                  autoComplete="off"
                  onChange={(e) =>
                    update("rentMonthly", Number(e.target.value))
                  }
                />

                <label>Charges mensuelles (€)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ex : 120"
                  autoComplete="off"
                  onChange={(e) =>
                    update("chargesMonthly", Number(e.target.value))
                  }
                />

                <label>Taxe foncière annuelle (€)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ex : 950"
                  autoComplete="off"
                  onChange={(e) =>
                    update("taxeFonciereYearly", Number(e.target.value))
                  }
                />

                <label>Apport (€)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ex : 30000"
                  autoComplete="off"
                  onChange={(e) =>
                    update("downPayment", Number(e.target.value))
                  }
                />

                <div className="form-row">
                  <div className="form-col">
                    <label>Taux d’intérêt (%)</label>
                    <input
                      type="number"
                      defaultValue={3}
                      onChange={(e) =>
                        update("interestRate", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="form-col">
                    <label>Durée du crédit (années)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      defaultValue={20}
                      autoComplete="off"
                      onChange={(e) =>
                        update("durationYears", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <button
                  className="primary-cta primary-chrome"
                  onClick={handleAnalyze}
                  style={{ marginTop: "1.2rem", marginBottom: "1.5rem" }}
                >
                  Analyser maintenant
                </button>

                {/* FONCTIONNALITÉS PREMIUM - NON CLIQUABLES SANS ABONNEMENT */}
                <div style={{ 
                  position: "relative",
                  opacity: (hasActivePremium(me) || hasActivePro(me)) ? 1 : 0.6,
                  pointerEvents: (hasActivePremium(me) || hasActivePro(me)) ? "auto" : "none"
                }}>
                  <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#44ffd2", fontWeight: 600 }}>
                    Fonctionnalités Premium (disponible avec Real Estate AI PREMIUM)
                  </p>
                  {!(hasActivePremium(me) || hasActivePro(me)) && (
                    <div 
                      onClick={() => scrollToId("pricing")}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(5, 5, 12, 0.7)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "0.6rem",
                        zIndex: 10
                      }}
                    >
                      <div style={{
                        background: "rgba(68, 255, 210, 0.95)",
                        color: "#050509",
                        padding: "0.6rem 1.2rem",
                        borderRadius: "999px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        boxShadow: "0 8px 24px rgba(68, 255, 210, 0.4)"
                      }}>
                        Débloquer avec Premium
                      </div>
                    </div>
                  )}

                <label>Frais de gestion (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="ex : 8"
                  autoComplete="off"
                  onChange={(e) =>
                    update("managementFeesPercent", Number(e.target.value))
                  }
                />
                <p className="form-bottom-note">Frais d'agence ou syndic sur les loyers annuels</p>

                <label>Garantie loyer impayé (€/mois)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ex : 45"
                  autoComplete="off"
                  onChange={(e) =>
                    update("rentalInsuranceMonthly", Number(e.target.value))
                  }
                />
                <p className="form-bottom-note">Coût mensuel de la couverture loyer impayé</p>

                <label>Prélèvement à la source (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="ex : 24"
                  autoComplete="off"
                  onChange={(e) =>
                    update("sourceWithholdingRate", Number(e.target.value))
                  }
                />
                <p className="form-bottom-note">Taux d'imposition sur les loyers</p>

                <label>Prélèvements sociaux (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="ex : 8"
                  autoComplete="off"
                  onChange={(e) =>
                    update("socialContributionsRate", Number(e.target.value))
                  }
                />
                <p className="form-bottom-note">CSG + CRDS sur les revenus fonciers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="section pricing-section">
          <PricingSection />
        </section>

        {/* FAQ */}
        <section id="faq" className="section section-faq">
          <div className="section-header">
            <p className="eyebrow">Questions fréquentes</p>
            <h2>Ce que les investisseurs demandent avant de tester.</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Est-ce que c’est fiable ?</h3>
              <p>
                L’algorithme se base uniquement sur tes chiffres (prix, loyer,
                charges, crédit). Pas de promesse magique, juste un modèle clair
                qui t’évite les mauvaises surprises.
              </p>
            </div>
            <div className="faq-item">
              <h3>J’ai besoin de laisser ma CB ?</h3>
              <p>
                Non. Tu peux tester l’analyseur gratuitement, sans CB. Tu ne
                paies que si tu as envie de passer en Premium / Pro.
              </p>
            </div>
            <div className="faq-item">
              <h3>Est-ce que ça marche si je débute ?</h3>
              <p>
                Oui, c’est même l’objectif : te donner une lecture simple du
                rendement et du cashflow, sans avoir à tout refaire sur Excel.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-column">
              <h3>Produit</h3>
              <ul>
                <li><a href="#analyzer">Analyseur de deals</a></li>
                <li><a href="#pricing">Plans tarifaires</a></li>
                <li><a href="#faq">Questions fréquentes</a></li>
                <li><a href="https://blog.realestateai.fr" target="_blank" rel="noopener noreferrer">Blog</a></li>
                <li><a href="https://roadmap.realestateai.fr" target="_blank" rel="noopener noreferrer">Roadmap</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Entreprise</h3>
              <ul>
                <li><a href="https://realestateai.fr/about" target="_blank" rel="noopener noreferrer">À propos de nous</a></li>
                <li><a href="mailto:realestateai@outlook.com">Contact</a></li>
                <li><a href="https://realestateai.fr/careers" target="_blank" rel="noopener noreferrer">Carrières</a></li>
                <li><a href="https://realestateai.fr/press" target="_blank" rel="noopener noreferrer">Presse</a></li>
                <li><a href="https://realestateai.fr/partners" target="_blank" rel="noopener noreferrer">Partenaires</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Support</h3>
              <ul>
                <li><a href="https://support.realestateai.fr" target="_blank" rel="noopener noreferrer">Centre d'aide</a></li>
                <li><a href="https://docs.realestateai.fr" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="https://api.realestateai.fr" target="_blank" rel="noopener noreferrer">API</a></li>
                <li><a href="https://status.realestateai.fr" target="_blank" rel="noopener noreferrer">Statut du service</a></li>
                <li><a href="mailto:realestateai@outlook.com?subject=Support">Support technique</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Légal</h3>
              <ul>
                <li><button className="footer-link-btn" onClick={() => setLegalPage('cgu')}>Conditions d'utilisation</button></li>
                <li><button className="footer-link-btn" onClick={() => setLegalPage('privacy')}>Confidentialité</button></li>
                <li><button className="footer-link-btn" onClick={() => setLegalPage('cookies')}>Cookies</button></li>
                <li><button className="footer-link-btn" onClick={() => setLegalPage('mentions')}>Mentions légales</button></li>
              </ul>
            </div>
          </div>

          <div className="footer-legal">
            <p className="footer-copyright">
              © 2025 Real Estate AI. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {legalPage && (
        <LegalPages 
          page={legalPage} 
          onClose={() => setLegalPage(null)} 
        />
      )}
    </div>
  );
}
