import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_TA = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

function getDayName(dateStr, lang) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return lang === "ta" ? DAYS_TA[d.getDay()] : DAYS_EN[d.getDay()];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function Attendance() {
  const { childrenData, attendance, markAttendance, addAttendanceRecord } = useApp();
  const { t, lang, formatName } = useLang();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const recordsForSelectedDate = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  const presentCount = recordsForSelectedDate.filter((a) => a.status === "present").length;
  const absentCount  = recordsForSelectedDate.filter((a) => a.status === "absent").length;

  // Per-child date form state: { [childId]: { date, nextVisitDate } }
  const [dateFields, setDateFields] = useState(() => {
    const init = {};
    childrenData.forEach((c) => {
      init[c._id || c.id] = { date: todayStr(), nextVisitDate: "" };
    });
    return init;
  });

  function handleFieldChange(childId, field, value) {
    setDateFields((prev) => ({
      ...prev,
      [childId]: { ...prev[childId], [field]: value },
    }));
  }

  function handleMark(childId, name, status) {
    const fields = dateFields[childId] || { date: todayStr(), nextVisitDate: "" };
    addAttendanceRecord({
      childId,
      name,
      date: fields.date,
      day: getDayName(fields.date, lang),
      status,
      nextVisitDate: fields.nextVisitDate,
    });
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.attendanceTitle}</h2>
        <p className="page-subtitle">{t.attendanceSubtitle}</p>
      </div>

      <div className="attendance-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
          <label style={{ fontWeight: 'bold' }}>{t.filterByDate}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', maxWidth: '200px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <div className="att-summary-card att-summary-present">
            <span className="att-sum-val">{presentCount}</span>
            <span className="att-sum-label">{t.present}</span>
          </div>
          <div className="att-summary-card att-summary-absent">
            <span className="att-sum-val">{absentCount}</span>
            <span className="att-sum-label">{t.absent}</span>
          </div>
          <div className="att-summary-card att-summary-total">
            <span className="att-sum-val">{childrenData.length}</span>
            <span className="att-sum-label">{t.totalChildren}</span>
          </div>
        </div>
      </div>

      {/* ── Attendance List with Date Fields ── */}
      <div className="form-card">
        <div className="attendance-list">
          {childrenData.map((child) => {
            const childId = child._id || child.id;
            const fields = dateFields[childId] || { date: todayStr(), nextVisitDate: "" };
            const dayName = getDayName(fields.date, lang);
            const childAtt = attendance.find(a => a.childId === childId && a.date === fields.date);
            const status = childAtt?.status;
            const absentCountDisplay = childAtt?.absentCount || 0;
            return (
              <div
                key={childId}
                className={`att-row att-row-extended ${status === "absent" ? "att-row-absent" : ""}`}
              >
                {/* Child info */}
                <div className="att-child-info">
                  <div className="att-child-name">{formatName(child.name, child.nameTa)}</div>
                  {absentCountDisplay >= 3 && (
                    <div className="att-warning">{t.absentDaysTotal.replace("{n}", absentCountDisplay)}</div>
                  )}
                </div>

                {/* Date fields */}
                <div className="att-date-fields">
                  <div className="att-date-group">
                    <label className="att-date-label">{t.attendanceDate}</label>
                    <input
                      type="date"
                      className="att-date-input"
                      value={fields.date}
                      onChange={(e) => handleFieldChange(childId, "date", e.target.value)}
                    />
                  </div>

                  <div className="att-date-group">
                    <label className="att-date-label">{t.dayLabel}</label>
                    <div className="att-day-display">{dayName || "—"}</div>
                  </div>

                  <div className="att-date-group">
                    <label className="att-date-label">{t.nextVisitDate}</label>
                    <input
                      type="date"
                      className="att-date-input"
                      value={fields.nextVisitDate}
                      min={fields.date}
                      onChange={(e) => handleFieldChange(childId, "nextVisitDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Present / Absent buttons */}
                <div className="att-buttons">
                  <button
                    className={`att-btn att-btn-present ${status === "present" ? "att-btn--active-present" : ""}`}
                    onClick={() => handleMark(childId, child.name, "present")}
                  >
                    {t.present}
                  </button>
                  <button
                    className={`att-btn att-btn-absent ${status === "absent" ? "att-btn--active-absent" : ""}`}
                    onClick={() => handleMark(childId, child.name, "absent")}
                  >
                    {t.absent}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Attendance Records Table ── */}
      {recordsForSelectedDate.length > 0 ? (
        <div className="section">
          <h3 className="section-title">{t.attendanceRecordsFor} {selectedDate}</h3>
          <div className="att-records-wrapper">
            <table className="att-records-table">
              <thead>
                <tr>
                  <th>{t.childName2}</th>
                  <th>{t.date}</th>
                  <th>{t.dayCol}</th>
                  <th>{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {[...recordsForSelectedDate].reverse().map((r) => (
                  <tr key={r._id || r.id}>
                    <td>{formatName(r.name, r.nameTa)}</td>
                    <td>{r.date}</td>
                    <td>{getDayName(r.date, lang)}</td>
                    <td>
                      <span className={`att-record-badge ${r.status === "present" ? "badge-present" : "badge-absent"}`}>
                        {r.status === "present" ? t.present : t.absent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="section">
          <p className="empty-state">{t.noAttendanceRecords} {selectedDate}.</p>
        </div>
      )}
    </div>
  );
}
