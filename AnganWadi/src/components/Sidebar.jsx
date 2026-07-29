import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";

export default function Sidebar({ active }) {
  const { setPage, logout, currentUser } = useApp();
  const { t, lang, switchLanguage, formatName } = useLang();

  const navItems = [
    { key: "dashboard",       label: t.dashboard,         abbr: "DB" },
    { key: "addChild",        label: t.addChild,          abbr: "AC" },
    { key: "childManagement", label: t.childManagement,   abbr: "CM" },
    { key: "attendance",      label: t.attendance,        abbr: "AT" },
    { key: "reports",         label: t.reports,           abbr: "RP" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-box">
          <img src="/logo.png" alt="MazhalaiValam Logo" className="sidebar-logo-img" />
        </div>
        <div>
          <div className="sidebar-title">{t.appName}</div>
          <div className="sidebar-role">{t.adminPanel}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? "nav-item--active" : ""}`}
            onClick={() => setPage(item.key)}
          >
            <span className="nav-icon nav-icon--abbr">{item.abbr}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="sidebar-lang-switcher">
        <button
          className={`lang-btn ${lang === "en" ? "lang-btn--active" : ""}`}
          onClick={() => switchLanguage("en")}
          title="English"
        >
          EN
        </button>
        <span className="lang-divider">|</span>
        <button
          className={`lang-btn ${lang === "ta" ? "lang-btn--active" : ""}`}
          onClick={() => switchLanguage("ta")}
          title="Tamil"
        >
          தமிழ்
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar-box">
            <span className="user-avatar-initials">
              {currentUser?.name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <div className="user-name">{formatName(currentUser?.name, currentUser?.nameTa)}</div>
            <div className="user-role">{t.administrator}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
