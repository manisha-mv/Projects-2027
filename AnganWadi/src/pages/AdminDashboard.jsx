import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard() {
  const { childrenData, attendance, setPage, setSelectedChildId } = useApp();
  const { t, formatName } = useLang();

  const totalChildren = childrenData.length;
  const underweightCount = childrenData.filter((c) => c.status === "underweight").length;
  const attentionCount = childrenData.filter((c) => c.status === "attention").length;
  const absentAlerts = attendance.filter((a) => a.absentCount >= 3);

  const stats = [
    { label: t.totalChildren,   value: totalChildren,  color: "card-blue"   },
    { label: t.normal,          value: childrenData.filter(c => c.status === "normal").length, color: "card-green"  },
    { label: t.needsAttention,  value: attentionCount, color: "card-yellow" },
    { label: t.underweight,     value: underweightCount, color: "card-red"  },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.dashboardOverview}</h2>
        <p className="page-subtitle">{t.dashboardSubtitle}</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {absentAlerts.length > 0 && (
        <div className="section">
          <h3 className="section-title">{t.absenceAlerts}</h3>
          <div className="alert-list">
            {absentAlerts.map((a) => (
              <div key={a.childId} className="alert-item">
                <span className="alert-name">{formatName(a.name, a.nameTa)}</span>
                <span className="alert-msg">
                  {t.absentFor} <strong>{a.absentCount}</strong> {a.absentCount > 1 ? t.days : t.day}
                </span>
                <button
                  className="btn-sm btn-outline"
                  onClick={() => {
                    setSelectedChildId(a.childId);
                    setPage("childDetails");
                  }}
                >
                  {t.view}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="section">
        <h3 className="section-title">{t.quickActions}</h3>
        <div className="quick-actions">
          <button className="quick-btn" onClick={() => setPage("addChild")}>{t.addChildBtn}</button>
          <button className="quick-btn" onClick={() => setPage("attendance")}>{t.markAttendance}</button>
          <button className="quick-btn" onClick={() => setPage("childManagement")}>{t.viewChildren}</button>
          <button className="quick-btn" onClick={() => setPage("reports")}>{t.viewReports}</button>
        </div>
      </div>

      {/* Recent Children */}
      <div className="section">
        <h3 className="section-title">{t.childrenOverview}</h3>
        <div className="children-table-wrapper">
          <table className="children-table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.age}</th>
                <th>{t.weight}</th>
                <th>{t.status}</th>
                <th>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {childrenData.map((child) => (
                <tr key={child._id || child.id}>
                  <td>{formatName(child.name, child.nameTa)}</td>
                  <td>{child.age} {t.yrs}</td>
                  <td>{child.weight}</td>
                  <td><StatusBadge status={child.status} /></td>
                  <td>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => {
                        setSelectedChildId(child._id || child.id);
                        setPage("childDetails");
                      }}
                    >
                      {t.details}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
