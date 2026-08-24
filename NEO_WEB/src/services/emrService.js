// services/emrService.js
// Electronic Medical Records — aggregated patient record — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const token = () => localStorage.getItem('neohms_token');
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const emrService = {
  async getPatientEMR(patientId) {
    if (!patientId) return null;

    // Try real backend first (aggregates everything)
    try {
      const res = await fetch(`${API_BASE_URL}/emr/patient/${patientId}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { emr: d.data, isLiveApi: true }; }
    } catch { /* fallback */ }

    // Build EMR locally from all localStorage stores
    const get = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };

    const patients     = get('neo_hms_patients_v1');
    const appointments = get('neo_hms_appointments_v1');
    const labOrders    = get('neo_hms_lab_v1');
    const radOrders    = get('neo_hms_radiology_v1');
    const prescriptions = get('neo_hms_pharmacy_prescriptions_v1');
    const admissions   = get('neo_hms_ipd_admissions_v1');
    const vitals       = get('neo_hms_nursing_vitals_v1');
    const nursingNotes = get('neo_hms_nursing_notes_v1');
    const surgeries    = get('neo_hms_surgery_v1');
    const followups    = get('neo_hms_followups_v1');
    const discharges   = get('neo_hms_discharges_v1');

    const patient = patients.find(p => p.id === patientId || p.patientId === patientId);
    if (!patient) return null;

    const emr = {
      patient,
      appointments:    appointments.filter(a => a.patientId === patientId),
      labOrders:       labOrders.filter(l => l.patientId === patientId),
      radiologyOrders: radOrders.filter(r => r.patientId === patientId),
      prescriptions:   prescriptions.filter(p => p.patientId === patientId),
      admissions:      admissions.filter(a => a.patientId === patientId),
      vitals:          vitals.filter(v => v.patientId === patientId),
      nursingNotes:    nursingNotes.filter(n => n.patientId === patientId),
      surgeries:       surgeries.filter(s => s.patientId === patientId),
      followups:       followups.filter(f => f.patientId === patientId),
      discharges:      discharges.filter(d => d.patientId === patientId),
    };

    return { emr, isLiveApi: false };
  },
};

export default emrService;
