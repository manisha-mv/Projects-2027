import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";

export default function AddChild() {
  const { addChild, setPage } = useApp();
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "", nameTa: "", age: "", parentName: "", parentNameTa: "", parentUsername: "",
    height: "", weight: "", gender: "Male", dob: "", healthNotes: "",
  });
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    addChild({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setForm({ name: "", nameTa: "", age: "", parentName: "", parentNameTa: "", parentUsername: "", height: "", weight: "", gender: "Male", dob: "", healthNotes: "" });
    }, 2000);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.addNewChild}</h2>
        <p className="page-subtitle">{t.addChildSubtitle}</p>
      </div>

      {success && <div className="success-banner">{t.childAddedSuccess}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit} className="add-child-form">
          <div className="form-grid">
            <div className="form-group">
              <label>{t.childNameEn}</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder={t.fullNameEn} required />
            </div>
            <div className="form-group">
              <label>{t.childNameTa}</label>
              <input name="nameTa" value={form.nameTa} onChange={handleChange} placeholder={t.fullNameTa} />
            </div>
            <div className="form-group">
              <label>{t.ageYears}</label>
              <input name="age" type="number" min="0" max="6" value={form.age} onChange={handleChange} placeholder={t.ageEg} required />
            </div>
            <div className="form-group">
              <label>{t.dateOfBirth}</label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t.gender}</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Male">{t.male}</option>
                <option value="Female">{t.female}</option>
                <option value="Other">{t.other}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.parentNameEn}</label>
              <input name="parentName" value={form.parentName} onChange={handleChange} placeholder={t.parentGuardianNameEn} required />
            </div>
            <div className="form-group">
              <label>{t.parentNameTa}</label>
              <input name="parentNameTa" value={form.parentNameTa} onChange={handleChange} placeholder={t.parentGuardianNameTa} />
            </div>
            <div className="form-group">
              <label>{t.parentUsername}</label>
              <input name="parentUsername" value={form.parentUsername} onChange={handleChange} placeholder={t.parentLoginUsername} required />
            </div>
            <div className="form-group">
              <label>{t.heightCm}</label>
              <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} placeholder={t.heightEg} required />
            </div>
            <div className="form-group">
              <label>{t.weightKg}</label>
              <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} placeholder={t.weightEg} required />
            </div>
          </div>

          <div className="form-group form-group--full">
            <label>{t.healthNotes}</label>
            <textarea
              name="healthNotes"
              value={form.healthNotes}
              onChange={handleChange}
              placeholder={t.healthNotesPlaceholder}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setPage("childManagement")}>{t.cancel}</button>
            <button type="submit" className="btn-primary">{t.addChildSubmit}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
