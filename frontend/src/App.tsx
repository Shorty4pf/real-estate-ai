// frontend/src/App.tsx
import { useState, useEffect } from "react";
import { PricingSection } from "./PricingSection";
import { AuthPage } from "./AuthPage";
import { SuccessPage } from "./SuccessPage";
import { LegalPages } from "./LegalPages";
import { AlertsManager } from "./AlertsManager";
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

  useEffect(() => {
    async function loadMe() {
      const t = token || localStorage.getItem("token");
      if (!t) return;
      try {
        const res = await fetch("http://localhost:4242/api/me", {
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
      const res = await fetch("http://localhost:4242/api/deals", {
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
    
    // Vérifier que l'utilisateur a un abonnement actif
    const hasActiveSubscription = me?.subscriptions?.some(
      (sub) => ['active', 'trialing'].includes(sub.status)
    );

    if (!hasActiveSubscription) {
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
                <div className="success-icon">🔒</div>
                <h1 className="success-title">Accès Réservé aux Abonnés</h1>
                <p className="success-subtitle">
                  Les alertes immobilières sont disponibles avec les plans Premium ou Pro.
                </p>
                <button
                  className="primary-cta primary-chrome success-cta"
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    setRoutePath("/");
                  }}
                >
                  Voir les plans tarifaires
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
              {me?.subscriptions?.some((sub) => ['active', 'trialing'].includes(sub.status)) && (
                <button
                  className="nav-link"
                  onClick={() => {
                    window.history.pushState({}, "", "/alerts");
                    setRoutePath("/alerts");
                  }}
                >
                  🔔 Alertes
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
                >
                  Analyser mon premier deal (gratuit)
                </button>
                <button
                  className="secondary-ghost"
                  onClick={() => scrollToId("pricing")}
                >
                  Voir les plans Premium →
                </button>
              </div>

              <div className="hero-kpis">
                <div className="kpi-card kpi-chrome">
                  <p className="kpi-label">✅ Utilisateurs actifs</p>
                  <p className="kpi-value">2,847+</p>
                </div>
                <div className="kpi-card kpi-chrome">
                  <p className="kpi-label">⚡ Temps/analyse</p>
                  <p className="kpi-value">7 sec</p>
                </div>
              </div>
            </div>

            {/* RIGHT : MOCKUP / STORY IMMOBILIÈRE */}
            <div className="hero-right">
              <div className="chrome-card mockup-card">
                <p className="mockup-title">Exemple réel – T2 • Bordeaux</p>
                <div className="mockup-body">
                  <div className="mockup-row">
                    <span>Prix affiché</span>
                    <span className="mockup-number">189 000 €</span>
                  </div>
                  <div className="mockup-row">
                    <span>Loyer visé</span>
                    <span className="mockup-number">850 €/mois</span>
                  </div>
                  <div className="mockup-row">
                    <span>Score IA</span>
                    <span className="mockup-number">87 / 100 🔥</span>
                  </div>
                  <div className="mockup-row">
                    <span>Cashflow mensuel</span>
                    <span className="mockup-number">+214 €</span>
                  </div>
                  <div className="mockup-row">
                    <span>Rendement net</span>
                    <span className="mockup-number">8,4 %</span>
                  </div>

                  <button
                    className="mockup-cta"
                    onClick={() => scrollToId("analyzer")}
                  >
                    Lancer le même calcul sur ton bien →
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

                    {/* Advanced analysis + alerts (requires subscription) */}
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="secondary-ghost"
                        onClick={async () => {
                          const tok = localStorage.getItem("token");
                          if (!tok) {
                            window.history.pushState({}, "", "/login");
                            setRoutePath("/login");
                            return;
                          }
                          try {
                            const res = await fetch(
                              "http://localhost:4242/api/analysis/advanced",
                              {
                                headers: { Authorization: `Bearer ${tok}` },
                              }
                            );
                            if (!res.ok) {
                              const t = await res
                                .json()
                                .catch(() => ({}));
                              alert(
                                t.error || "Accès refusé — abonnement requis"
                              );
                              return;
                            }
                            const d = await res.json();
                            alert(
                              "Analyse avancée: " +
                                (d.report?.phrases?.join(", ") || "ok")
                            );
                          } catch (err) {
                            console.error(err);
                            alert(
                              "Erreur en appelant l’analyse avancée"
                            );
                          }
                        }}
                      >
                        Accéder à l'analyse complète
                      </button>
                    </div>

                    {/* 🔒 TEASER PREMIUM SOUS LECTURE RAPIDE */}
                    <div
                      className="premium-teaser"
                      onClick={() => scrollToId("pricing")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          scrollToId("pricing");
                      }}
                    >
                      <p className="premium-teaser-title">
                        🚀 Passez à la suite : Analyses avancées
                      </p>
                      <p className="premium-teaser-text">
                        Débloquez des scénarios financiers avancés, les alertes
                        temps réel sur les nouveaux biens et l'accès complet à
                        tous les outils. À partir de 14,99€/mois.
                      </p>
                      <button
                        className="premium-teaser-btn"
                        type="button"
                        onClick={() => scrollToId("pricing")}
                      >
                        Voir les abonnements Premium & Pro
                      </button>
                    </div>
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
                <p className="form-title">🔍 Analyser un bien</p>
                <p className="form-caption">
                  Colle les chiffres réels du bien que tu regardes. 30 secondes max.
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
                  placeholder="ex : 850"
                  onChange={(e) =>
                    update("rentMonthly", Number(e.target.value))
                  }
                />

                <label>Charges mensuelles (€)</label>
                <input
                  type="number"
                  placeholder="ex : 120 (copro, entretien, etc.)"
                  onChange={(e) =>
                    update("chargesMonthly", Number(e.target.value))
                  }
                />

                <label>Taxe foncière annuelle (€)</label>
                <input
                  type="number"
                  placeholder="ex : 950"
                  onChange={(e) =>
                    update("taxeFonciereYearly", Number(e.target.value))
                  }
                />

                <label>Apport (€)</label>
                <input
                  type="number"
                  placeholder="ex : 30000"
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
                      defaultValue={20}
                      onChange={(e) =>
                        update("durationYears", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <button
                  className="primary-cta primary-chrome"
                  onClick={handleAnalyze}
                >
                  ⚡ Analyser maintenant
                </button>
                <p className="form-bottom-note">
                  Modifie les chiffres en direct pour voir l'impact sur votre rendement.
                </p>
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
