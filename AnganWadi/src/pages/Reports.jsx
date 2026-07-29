import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import StatusBadge from "../components/StatusBadge";

export default function Reports() {
  const { childrenData, attendance, setSelectedChildId, setPage } = useApp();
  const { t, formatName } = useLang();

  const underweight = childrenData.filter((c) => c.status === "underweight");
  const attention = childrenData.filter((c) => c.status === "attention");
  const frequentlyAbsent = attendance.filter((a) => a.absentCount >= 3);

  const priority = childrenData
    .map((c) => {
      const att = attendance.find((a) => a.childId === (c._id || c.id));
      const score =
        (c.status === "underweight" ? 3 : c.status === "attention" ? 1 : 0) +
        (att?.absentCount >= 3 ? 2 : 0);
      return { ...c, score, absentCount: att?.absentCount || 0 };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  function viewChild(id) {
    setSelectedChildId(id);
    setPage("childDetails");
  }

  const Section = ({ title, children }) => (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );

  const EmptyMsg = () => (
    <div className="report-empty">{t.noIssues}</div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.reportsTitle}</h2>
        <p className="page-subtitle">{t.reportsSubtitle}</p>
      </div>

      {/* Priority List */}
      <Section title={t.priorityActionList}>
        {priority.length === 0 ? (
          <EmptyMsg />
        ) : (
          <div className="report-cards">
            {priority.map((c) => (
              <div key={c._id || c.id} className={`report-card report-card--${c.status}`}>
                <div className="report-card-top">
                  <div>
                    <div className="report-child-name">{formatName(c.name, c.nameTa)}</div>
                    <div className="report-child-age">{c.age} {t.yrs} &middot; {c.gender}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="report-card-body">
                  <div className="report-detail"><span>{t.weightLabel}</span> <strong>{c.weight} kg</strong></div>
                  <div className="report-detail"><span>{t.absentDays}</span> <strong>{c.absentCount}</strong></div>
                  <div className="priority-score">{t.priorityScore} {c.score}/5</div>
                </div>
                <button className="btn-sm btn-primary" onClick={() => viewChild(c._id || c.id)}>
                  {t.viewDetails}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Underweight */}
      <Section title={t.underweightChildren}>
        {underweight.length === 0 ? (
          <EmptyMsg />
        ) : (
          <div className="report-list">
            {underweight.map((c) => (
              <div key={c._id || c.id} className="report-list-item" onClick={() => viewChild(c._id || c.id)}>
                <div>
                  <span className="rl-name">{formatName(c.name, c.nameTa)}</span>
                  <span className="rl-meta">{c.age} {t.yrs} &middot; {c.weight} kg</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Needs Attention */}
      <Section title={t.needsAttentionSection}>
        {attention.length === 0 ? (
          <EmptyMsg />
        ) : (
          <div className="report-list">
            {attention.map((c) => (
              <div key={c._id || c.id} className="report-list-item" onClick={() => viewChild(c._id || c.id)}>
                <div>
                  <span className="rl-name">{formatName(c.name, c.nameTa)}</span>
                  <span className="rl-meta">{c.age} {t.yrs} &middot; {c.weight} kg</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Frequently Absent */}
      <Section title={t.frequentlyAbsent}>
        {frequentlyAbsent.length === 0 ? (
          <EmptyMsg />
        ) : (
          <div className="report-list">
            {frequentlyAbsent.map((a) => {
              const child = childrenData.find((c) => c._id === a.childId || c.id === a.childId);
              return (
                <div key={a.childId} className="report-list-item" onClick={() => viewChild(a.childId)}>
                  <div>
                    <span className="rl-name">{child ? formatName(child.name, child.nameTa) : formatName(a.name, a.nameTa)}</span>
                    <span className="rl-meta">{t.absentDaysCount.replace("{n}", a.absentCount)}</span>
                  </div>
                  {child && <StatusBadge status={child.status} />}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
