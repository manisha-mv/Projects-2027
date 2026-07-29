import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import StatusBadge from "../components/StatusBadge";

export default function ChildDetails({ isParent = false }) {
  const { childrenData, selectedChildId, setPage, attendance, updateChild, deleteChild } = useApp();
  const { t, formatName } = useLang();
  const child = childrenData.find((c) => c._id === selectedChildId || c.id === selectedChildId);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [newVaccine, setNewVaccine] = useState({ name: "", date: "" });

  if (!child) {
    return (
      <div className="page-content">
        <div className="empty-state">{t.childNotFound}</div>
      </div>
    );
  }

  function handleEditClick() {
    setEditForm({
      name: child.name,
      nameTa: child.nameTa || "",
      age: child.age,
      parentName: child.parentName,
      parentNameTa: child.parentNameTa || "",
      parentUsername: child.parentUsername,
      height: child.height,
      weight: child.weight,
      gender: child.gender,
      dob: child.dob || "",
      healthNotes: child.healthNotes || child.alerts.join(", ") || "",
    });
    setIsEditing(true);
  }

  function handleDeleteClick() {
    if (window.confirm(t.deleteConfirm)) {
      deleteChild(child._id || child.id);
      setPage("childManagement");
    }
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    updateChild(child._id || child.id, {
      ...editForm,
      age: Number(editForm.age),
      height: Number(editForm.height),
      weight: Number(editForm.weight),
    });
    setIsEditing(false);
  }

  function handleAddVaccine(e) {
    e.preventDefault();
    if (!newVaccine.name || !newVaccine.date) return;
    const updatedVaccinations = [...(child.vaccinations || []), { ...newVaccine, done: false }];
    updateChild(child._id || child.id, { vaccinations: updatedVaccinations });
    setNewVaccine({ name: "", date: "" });
  }

  function handleToggleVaccineDone(index) {
    const updatedVaccinations = (child.vaccinations || []).map((v, i) => i === index ? { ...v, done: !v.done } : v);
    updateChild(child._id || child.id, { vaccinations: updatedVaccinations });
  }

  function handleDeleteVaccine(index) {
    if (!window.confirm(t.removeVaccineConfirm)) return;
    const updatedVaccinations = (child.vaccinations || []).filter((_, i) => i !== index);
    updateChild(child._id || child.id, { vaccinations: updatedVaccinations });
  }

  if (isEditing) {
    return (
      <div className="page-content">
        <div className="page-header">
          <h2 className="page-title">{t.editChildDetails}</h2>
          <p className="page-subtitle">{t.updateInfoFor} {child.name}</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleEditSubmit} className="add-child-form">
            <div className="form-grid">
              <div className="form-group">
                <label>{t.childNameEn}</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>{t.childNameTa}</label>
                <input name="nameTa" value={editForm.nameTa} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>{t.ageYears}</label>
                <input name="age" type="number" min="0" max="6" value={editForm.age} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>{t.dateOfBirth}</label>
                <input name="dob" type="date" value={editForm.dob} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>{t.gender}</label>
                <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.parentNameEn}</label>
                <input name="parentName" value={editForm.parentName} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>{t.parentNameTa}</label>
                <input name="parentNameTa" value={editForm.parentNameTa} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>{t.parentUsername}</label>
                <input name="parentUsername" value={editForm.parentUsername} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>{t.heightCm}</label>
                <input name="height" type="number" step="0.1" value={editForm.height} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>{t.weightKg}</label>
                <input name="weight" type="number" step="0.1" value={editForm.weight} onChange={handleEditChange} required />
              </div>
            </div>

            <div className="form-group form-group--full">
              <label>{t.healthNotes}</label>
              <textarea
                name="healthNotes"
                value={editForm.healthNotes}
                onChange={handleEditChange}
                placeholder={t.healthNotesPlaceholder}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>{t.cancel}</button>
              <button type="submit" className="btn-primary">{t.update}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const heightGrowth = child.height - child.prevHeight;
  const weightGrowth = child.weight - child.prevWeight;
  const childId = child._id || child.id;
  const childAttRecords = attendance.filter((a) => a.childId === childId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const attendanceRecord = childAttRecords[0];
  const nextVisitRecord = childAttRecords.find(a => a.nextVisitDate);
  const nextVisitDate = nextVisitRecord ? nextVisitRecord.nextVisitDate : null;

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button
          className="back-btn"
          onClick={() => setPage(isParent ? "parentDashboard" : "childManagement")}
        >
          {t.back}
        </button>

        {!isParent && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleEditClick}
              style={{ padding: "0.5rem 1rem", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", color: "#334155", fontWeight: "500" }}
            >
              {t.editChild}
            </button>
            <button
              onClick={handleDeleteClick}
              style={{ padding: "0.5rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontWeight: "500" }}
            >
              {t.deleteChild}
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="details-hero">
        <div className="details-avatar-box">
          <span className="details-avatar-initial">{child.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="details-hero-info">
          <h2 className="details-name">{formatName(child.name, child.nameTa)}</h2>
          <p className="details-meta">
            {child.age} {t.yearsOld} &middot; {child.gender} &middot; {t.dob} {child.dob || t.notAvailable}
          </p>
          <p className="details-meta">{t.parentName.replace(" *", "")}: {formatName(child.parentName, child.parentNameTa)}</p>
          <StatusBadge status={child.status} />
        </div>
      </div>

      <div className="details-grid">
        {/* Measurements */}
        <div className="detail-card">
          <h3 className="detail-card-title">{t.growthMeasurements}</h3>
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
          <div className="prev-values">
            <small>{t.previousValues} {child.prevHeight} cm &middot; {t.weightLabelP} {child.prevWeight} kg</small>
          </div>
        </div>

        {/* Attendance */}
        <div className="detail-card">
          <h3 className="detail-card-title">{t.attendanceCard}</h3>
          <div className="attendance-summary">
            <div className={`att-stat ${attendanceRecord?.absentCount >= 3 ? "att-danger" : "att-ok"}`}>
              <span className="att-number">{attendanceRecord?.absentCount || 0}</span>
              <span className="att-label">{t.daysAbsent}</span>
            </div>
            <div className="att-status">
              {t.today}{" "}
              <strong className={attendanceRecord?.status === "absent" ? "text-red" : "text-green"}>
                {attendanceRecord?.status === "absent" ? t.absent : attendanceRecord?.status === "present" ? t.present : t.noRecord}
              </strong>
            </div>
          </div>
          {nextVisitDate && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
              <span className="measure-label">{t.nextVisit}</span>
              <div style={{ fontWeight: "600", color: "#0f172a", marginTop: "0.25rem" }}>{nextVisitDate}</div>
            </div>
          )}

          {/* Attendance History */}
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0.5rem" }}>{t.attendanceHistory}</h4>
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
        {child.alerts && child.alerts.length > 0 && (
          <div className="detail-card card-alert">
            <h3 className="detail-card-title">{t.activeAlerts}</h3>
            <ul className="alert-ul">
              {child.alerts.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Symptoms / Health Notes */}
        {child.healthNotes && (
          <div className="detail-card">
            <h3 className="detail-card-title">{t.symptomsHealthNotes}</h3>
            <p className="detail-text">{child.healthNotes}</p>
          </div>
        )}

        {/* Nutrition */}
        <div className="detail-card">
          <h3 className="detail-card-title">{t.nutritionSuggestion}</h3>
          <p className="detail-text">{child.nutrition}</p>
        </div>

        {/* Vaccinations */}
        <div className="detail-card">
          <h3 className="detail-card-title">{t.vaccinationRecord}</h3>
          {!child.vaccinations || child.vaccinations.length === 0 ? (
            <p className="detail-text">{t.noVaccinationRecords}</p>
          ) : (
            <div className="vacc-list">
              {child.vaccinations.map((v, i) => (
                <div key={i} className={`vacc-item ${v.done ? "vacc-done" : "vacc-pending"}`}>
                  <span className={`vacc-status-dot ${v.done ? "vacc-dot-done" : "vacc-dot-pending"}`}></span>
                  <div style={{ flex: 1 }}>
                    <div className="vacc-name">{v.name}</div>
                    <div className="vacc-date">{v.done ? t.completed : t.pending} &middot; {v.date}</div>
                  </div>
                  {!isParent && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => handleToggleVaccineDone(i)}
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", background: v.done ? "#f1f5f9" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        {v.done ? t.markUndone : t.markDone}
                      </button>
                      <button
                        onClick={() => handleDeleteVaccine(i)}
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "0.8rem" }}
                        title="Remove Vaccination"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {isParent && !v.done && (
                    <button
                      onClick={() => handleToggleVaccineDone(i)}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #10b981", background: "#ecfdf5", color: "#059669", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      {t.markDone}
                    </button>
                  )}
                  {isParent && v.done && (
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{t.done}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isParent && (
            <form onSubmit={handleAddVaccine} style={{ marginTop: "1rem", display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem", color: "#64748b" }}>{t.vaccineName}</label>
                <input
                  type="text"
                  value={newVaccine.name}
                  onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                  placeholder={t.vaccineNamePlaceholder}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem", color: "#64748b" }}>{t.dateLabel}</label>
                <input
                  type="date"
                  value={newVaccine.date}
                  onChange={(e) => setNewVaccine({ ...newVaccine, date: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "none", background: "#3b82f6", color: "white", cursor: "pointer", height: "fit-content" }}
              >
                {t.add}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
