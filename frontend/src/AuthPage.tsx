import { useState } from "react";
import { API_BASE_URL } from "./config";

type Mode = "login" | "signup";

export const AuthPage = () => {
  const initialMode: Mode =
    window.location.pathname === "/signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Impossible de traiter la demande.");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Erreur réseau. Vérifiez votre connexion internet ou réessayez plus tard."
      );
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-container">
        {/* Back button */}
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => (window.location.href = "/")}
        >
          ← Retour à l'analyse
        </button>

        {/* Main card */}
        <div className="chrome-card auth-card">
          <div className="auth-header">
            <div className="auth-badge">Real Estate AI</div>
            <h1 className="auth-title">
              {isLogin ? "Reconnecter pour continuer" : "Créer votre compte"}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? "Accédez à vos analyses et à vos plans Premium/Pro." 
                : "Pas de CB requise. Testez gratuitement."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-mode-btn ${isLogin ? "auth-mode-active" : ""}`}
              onClick={() => {
                setMode("login");
                window.history.pushState({}, "", "/login");
              }}
            >
              Se connecter
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${!isLogin ? "auth-mode-active" : ""}`}
              onClick={() => {
                setMode("signup");
                window.history.pushState({}, "", "/signup");
              }}
            >
              Créer un compte
            </button>
          </div>

          {/* Form */}
          <form className="auth-form form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse e-mail</label>
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && <div className="auth-error-msg">{errorMsg}</div>}

            <button
              type="submit"
              className="primary-cta primary-chrome auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Vérification..."
                : isLogin
                ? "Se connecter"
                : "S'inscrire gratuitement"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setMode("signup");
                    window.history.pushState({}, "", "/signup");
                  }}
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setMode("login");
                    window.history.pushState({}, "", "/login");
                  }}
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
