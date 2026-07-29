import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import StatusBadge from "../components/StatusBadge";
import { childrenAPI } from "../api/api";

export default function ParentDashboard() {
  const { currentUser, attendance, logout, updateChild } = useApp();
  const { t, lang, switchLanguage, formatName } = useLang();
  const [child, setChild] = useState(null);
  const [loadingChild, setLoadingChild] = useState(true);

  useEffect(() => {
    if (currentUser?.username) {
      childrenAPI.getChildByParentUsername(currentUser.username)
        .then(res => setChild(res.data))
        .catch(err => console.error("Error fetching child", err))
        .finally(() => setLoadingChild(false));
    } else {
      setLoadingChild(false);
    }
  }, [currentUser]);

  function handleToggleVaccineDone(index) {
    if (!child) return;
    const updatedVaccinations = (child.vaccinations || []).map((v, i) => i === index ? { ...v, done: !v.done } : v);
    updateChild(child._id || child.id, { vaccinations: updatedVaccinations });
    setChild({ ...child, vaccinations: updatedVaccinations });
  }

  const childId = child?._id || child?.id;
  const childAttRecords = child ? attendance.filter((a) => a.childId === childId).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const attRecord = childAttRecords[0];
  const nextVisitRecord = childAttRecords.find(a => a.nextVisitDate);
  const nextVisitDate = nextVisitRecord ? nextVisitRecord.nextVisitDate : null;

  const heightGrowth = child ? child.height - child.prevHeight : 0;
  const weightGrowth = child ? child.weight - child.prevWeight : 0;

  const TopBar = () => (
    <div className="parent-topbar">
      <div className="parent-brand-wrapper">
        <img src="/logo.png" alt="MazhalaiValam Logo" className="parent-brand-logo" />
        <div className="parent-brand">{t.smartAnganwadi}</div>
      </div>
      <div className="parent-topbar-right">
        {/* Language switcher in parent topbar */}
        <div className="parent-lang-switcher">
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
        <span className="parent-greeting">{t.welcome} {formatName(currentUser?.name, currentUser?.nameTa)}</span>
        <button className="btn-logout" onClick={logout}>{t.logout}</button>
      </div>
    </div>
  );

  if (loadingChild) {
    return (
      <div className="parent-bg">
        <TopBar />
        <div className="page-content">
          <div className="empty-state">{t.loadingChildData}</div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="parent-bg">
        <TopBar />
        <div className="page-content">
          <div className="empty-state">{t.noChildLinked}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-bg">
      {/* Top Bar */}
      <TopBar />

      <div className="parent-content">
        {/* Child Profile */}
        <div className="parent-hero">
          <div className="parent-hero-avatar-box">
            <span className="parent-hero-avatar-initial">{child.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="parent-child-name">{formatName(child.name, child.nameTa)}</h2>
            <p className="parent-child-meta">
              {child.age} {t.yearsOld} &middot; {child.gender} &middot; {t.dob} {child.dob || t.notAvailable}
            </p>
            <StatusBadge status={child.status} />
          </div>
        </div>

        <div className="parent-grid">
          {/* Growth Card */}
          <div className="parent-card">
            <h3 className="parent-card-title">{t.growthCard}</h3>
            <div className="measure-grid">
              <div className="measure-item">
                <span className="measure-label">{t.heightLabel}</span>
                <span className="measure-value">{child.height} cm</span>
                <span className={`measure-change ${heightGrowth >= 0 ? "positive" : "negative"}`}>
                  {heightGrowth >= 0 ? "+" : ""}{Math.abs(heightGrowth).toFixed(1)} cm
                </span>
              </div>
              <div className="measure-item">
                <span className="measure-label">{t.weightLabelP}</span>
                <span className="measure-value">{child.weight} kg</span>
                <span className={`measure-change ${weightGrowth >= 0 ? "positive" : "negative"}`}>
                  {weightGrowth >= 0 ? "+" : ""}{Math.abs(weightGrowth).toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="parent-card">
            <h3 className="parent-card-title">{t.attendanceCard}</h3>
            <div className="attendance-summary">
              <div className={`att-stat ${attRecord?.absentCount >= 3 ? "att-danger" : "att-ok"}`}>
                <span className="att-number">{attRecord?.absentCount || 0}</span>
                <span className="att-label">{t.daysAbsent}</span>
              </div>
              <div className="att-status">
                {t.todayStatus}{" "}
                <strong className={attRecord?.status === "absent" ? "text-red" : "text-green"}>
                  {attRecord?.status === "absent" ? t.absent : attRecord?.status === "present" ? t.present : t.noRecord}
                </strong>
              </div>
            </div>
            {nextVisitDate && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                <span className="measure-label">{t.nextVisitDateP}</span>
                <div style={{ fontWeight: "600", color: "#0f172a", marginTop: "0.25rem" }}>{nextVisitDate}</div>
              </div>
            )}

            {/* Attendance History */}
            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0.5rem" }}>{t.attendanceHistoryP}</h4>
              {childAttRecords.length === 0 ? (
                <p className="detail-text" style={{ fontSize: "0.85rem" }}>{t.noHistory}</p>
              ) : (
                <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                  <table style={{ width: "100%", fontSize: "0.85rem", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                      <tr>
                        <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{t.dateLabel}</th>
                        <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{t.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childAttRecords.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.5rem" }}>{r.date}</td>
                          <td style={{ padding: "0.5rem" }}>
                            <span style={{
                              padding: "0.15rem 0.4rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              background: r.status === "present" ? "#dcfce7" : "#fee2e2",
                              color: r.status === "present" ? "#166534" : "#991b1b"
                            }}>
                              {r.status === "present" ? t.present : t.absent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {child.alerts.length > 0 && (
            <div className="parent-card card-alert">
              <h3 className="parent-card-title">{t.alertsCard}</h3>
              <ul className="alert-ul">
                {child.alerts.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutrition */}
          <div className="parent-card">
            <h3 className="parent-card-title">{t.nutritionCard}</h3>
            <p className="detail-text">{child.nutrition}</p>
          </div>

          {/* Vaccinations */}
          <div className="parent-card">
            <h3 className="parent-card-title">{t.vaccinationCard}</h3>
            {child.vaccinations.length === 0 ? (
              <p className="detail-text">{t.noRecords}</p>
            ) : (
              <div className="vacc-list">
                {child.vaccinations.map((v, i) => (
                  <div key={i} className={`vacc-item ${v.done ? "vacc-done" : "vacc-pending"}`}>
                    <span className={`vacc-status-dot ${v.done ? "vacc-dot-done" : "vacc-dot-pending"}`}></span>
                    <div style={{ flex: 1 }}>
                      <div className="vacc-name">{v.name}</div>
                      <div className="vacc-date">{v.done ? t.completed : t.pending} &middot; {v.date}</div>
                    </div>
                    {!v.done && (
                      <button
                        onClick={() => handleToggleVaccineDone(i)}
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #10b981", background: "#ecfdf5", color: "#059669", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        {t.markDone}
                      </button>
                    )}
                    {v.done && (
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{t.done}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
