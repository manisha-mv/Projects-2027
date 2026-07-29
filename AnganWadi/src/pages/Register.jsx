import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";

export default function Register() {
  const { register, login, setPage } = useApp();
  const { t, lang, switchLanguage } = useLang();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(username.trim(), password, role, name, nameTa);
    if (!result.success) {
      setError(result.message || "Registration failed. Please check if the server is running or try again.");
      setLoading(false);
      return;
    }

    // On success, auto-login the user
    const loginOk = await login(username.trim(), password);
    if (!loginOk) {
      setPage("login");
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Language switcher */}
        <div className="login-lang-switcher">
          <button
            className={`lang-btn ${lang === "en" ? "lang-btn--active" : ""}`}
            onClick={() => switchLanguage("en")}
          >
            EN
          </button>
          <span className="lang-divider">|</span>
          <button
            className={`lang-btn ${lang === "ta" ? "lang-btn--active" : ""}`}
            onClick={() => switchLanguage("ta")}
          >
            தமிழ்
          </button>
        </div>

        <div className="login-logo">
          <img src="/logo.png" alt="MazhalaiValam Logo" className="login-logo-img" />
        </div>

        <h1 className="login-title">{t.createAccount}</h1>
        <p className="login-subtitle">{t.joinSystem}</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                placeholder={t.createUsername}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">{t.nameEn}</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                placeholder={t.enterNameEn}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nameTa">{t.nameTa}</label>
            <div className="input-wrapper">
              <input
                id="nameTa"
                type="text"
                placeholder={t.enterNameTa}
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={t.createPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="role">{t.role}</label>
            <div className="input-wrapper">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#1e293b", fontSize: "0.95rem" }}
              >
                <option value="admin">{t.admin}</option>
                <option value="parent">{t.parent}</option>
              </select>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <span className="spinner" /> : t.register}
          </button>
        </form>

        <div className="login-hints">
          <p>{t.alreadyHaveAccount}</p>
          <button
            type="button"
            className="link-btn"
            onClick={() => setPage("login")}
            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "500", cursor: "pointer", textDecoration: "underline", padding: "0" }}
          >
            {t.signInHere}
          </button>
        </div>

        {role === "parent" && (
          <div className="login-hints" style={{ marginTop: "1rem", textAlign: "left", background: "#eff6ff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#1e3a8a" }}>
              <strong>{t.parentRegistrationNote}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
