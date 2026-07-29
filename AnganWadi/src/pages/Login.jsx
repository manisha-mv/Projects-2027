import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import heroImage from "./first_Image.jpg";
import bgImage from "./second_image.png";

export default function Login() {
  const { login, setPage } = useApp();
  const { t, lang, switchLanguage } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (!ok) setError(t.invalidCredentials);
  }

  return (
    <div className="login-split-bg">

      {/* ══════════════════════════════════════
          LEFT PANEL — Hero Image + Branding
      ══════════════════════════════════════ */}
      <div className="login-brand-panel" style={{ padding: 0 }}>

        {/* first_Image.jpg — full cover */}
        <img
          src={heroImage}
          alt="Anganwadi Child Care"
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(10,40,20,0.72) 100%)"
        }} />

        {/* ── Top: Brand name ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "2rem 2.5rem", zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 8, height: 44,
              background: "linear-gradient(180deg, #22c55e, #16a34a)",
              borderRadius: 4, flexShrink: 0
            }} />
            <div>
              <h1 style={{
                fontSize: "1.65rem", fontWeight: 900, color: "#fff",
                letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.45)"
              }}>
                MAZHALAIVALAM
              </h1>
              <p style={{
                fontSize: "0.75rem", fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.05em", marginTop: "0.25rem"
              }}>
                Smart Anganwadi Child Health Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* ── Centre: Headline + Features ── */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          transform: "translateY(-50%)",
          padding: "0 2.5rem", zIndex: 10
        }}>
          <h2 style={{
            fontSize: "2rem", fontWeight: 800, color: "#fff",
            lineHeight: 1.3, marginBottom: "1.5rem",
            textShadow: "0 2px 14px rgba(0,0,0,0.5)"
          }}>
            Every Child Deserves<br />Better Care
          </h2>

          {[
            { icon: "🌱", label: "Child Health Monitoring" },
            { icon: "📊", label: "Growth & Nutrition Tracking" },
            { icon: "📅", label: "Attendance Management" },
            { icon: "💉", label: "Vaccination Records" }
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.65rem" }}>
              <span style={{
                background: "rgba(34,197,94,0.22)", border: "1px solid rgba(34,197,94,0.45)",
                borderRadius: "50%", width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.88rem", flexShrink: 0
              }}>{icon}</span>
              <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Bottom: Tamil Quote ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "1.5rem 2.5rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(6px)",
          zIndex: 10
        }}>
          <p style={{
            fontSize: "0.97rem", fontWeight: 600, color: "#86efac",
            lineHeight: 1.65, fontStyle: "italic", marginBottom: "0.4rem"
          }}>
            "குழந்தை வளர்ப்பு என்பது ஒரு கலை;<br />
            அன்பே அதன் அடிப்படை."
          </p>
          <p style={{
            fontSize: "0.71rem", color: "rgba(255,255,255,0.48)",
            letterSpacing: "0.03em"
          }}>
            — Raising a child is an art; love is its foundation.
          </p>
        </div>

      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════ */}
      <div className="login-form-panel" style={{ position: "relative" }}>

        {/* second_image.png — very subtle background texture */}
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            opacity: 0.10, zIndex: 0, pointerEvents: "none"
          }}
        />

        {/* Light overlay to keep form readable */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(255,255,255,0.88)",
          zIndex: 0
        }} />

        {/* Language switcher */}
        <div className="login-lang-switcher login-lang-switcher--panel" style={{ position: "relative", zIndex: 1 }}>
          <button
            className={`lang-btn lang-btn--dark ${lang === "en" ? "lang-btn--active-dark" : ""}`}
            onClick={() => switchLanguage("en")}
          >
            EN
          </button>
          <span className="lang-divider lang-divider--dark">|</span>
          <button
            className={`lang-btn lang-btn--dark ${lang === "ta" ? "lang-btn--active-dark" : ""}`}
            onClick={() => switchLanguage("ta")}
          >
            தமிழ்
          </button>
        </div>

        <div className="login-panel-content" style={{ position: "relative", zIndex: 1 }}>

          {/* Mobile-only logo */}
          <div className="login-mobile-logo">
            <img src="/logo.png" alt="MazhalaiValam Logo" className="login-logo-img" />
            <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginTop: "0.5rem" }}>MazhalaiValam</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>மழலைவளம்</p>
          </div>

          <h2 className="login-panel-title">{t.welcomeBack || "Welcome Back"}</h2>
          <p className="login-panel-subtitle">{t.signInToContinue || "Sign in to your account to continue"}</p>

          {/* ── Form — all fields, state, handlers UNCHANGED ── */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">{t.username}</label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  placeholder={t.enterUsername}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">{t.password}</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder={t.enterPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? t.hide : t.show}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <span className="spinner" /> : t.login}
            </button>
          </form>

          <div className="login-hints">
            <p>{t.demoCredentials}</p>
            <div className="hint-chips">
              <span className="chip" onClick={() => { setUsername("admin"); setPassword("admin123"); }}>
                {t.admin}
              </span>
              <span className="chip" onClick={() => { setUsername("parent1"); setPassword("pass123"); }}>
                {t.parent}
              </span>
            </div>
          </div>

          <div className="login-hints" style={{ marginTop: "1.5rem" }}>
            <p>{t.dontHaveAccount}</p>
            <button
              type="button"
              onClick={() => setPage("register")}
              style={{
                background: "none", border: "none",
                color: "var(--primary)", fontWeight: "600",
                cursor: "pointer", textDecoration: "underline", padding: "0"
              }}
            >
              {t.registerHere}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
