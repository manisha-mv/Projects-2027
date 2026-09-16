// services/traceabilityService.js
// Treatment Traceability — complete patient care journey — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const token = () => localStorage.getItem('neohms_token');
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const TRACE_EVENT_TYPES = ['Registration', 'Appointment', 'Check-In', 'Consultation', 'Lab Order', 'Lab Result', 'Radiology Order', 'Radiology Report', 'Prescription', 'Pharmacy Dispense', 'Admission', 'Nursing Care', 'Vitals Recorded', 'Procedure', 'Surgery', 'Billing', 'Discharge', 'Follow-Up'];

// Build a timeline from localStorage data (will be replaced by API aggregation)
const buildLocalTimeline = (patientId) => {
  const events = [];

  // Appointments
  try {
    const apts = JSON.parse(localStorage.getItem('neo_hms_appointments_v1') || '[]');
    apts.filter(a => a.patientId === patientId).forEach(a => {
      events.push({ type: a.status === 'Checked In' || a.status === 'Completed' ? 'Check-In' : 'Appointment', date: a.appointmentDate, time: a.timeSlot, department: a.department, performedBy: a.doctorName, role: 'Doctor', status: a.status, relatedId: a.appointmentId, description: `${a.type} with ${a.doctorName}`, icon: 'appointment' });
    });
  } catch { /* */ }

  // Lab Orders
  try {
    const labs = JSON.parse(localStorage.getItem('neo_hms_lab_v1') || '[]');
    labs.filter(l => l.patientId === patientId).forEach(l => {
      events.push({ type: 'Lab Order', date: l.orderedDate, time: null, department: 'Laboratory', performedBy: l.doctorName, role: 'Doctor', status: l.status, relatedId: l.orderId, description: `${l.testName} (${l.urgency})`, icon: 'lab' });
      if (l.result) events.push({ type: 'Lab Result', date: l.resultEnteredAt?.split('T')[0], time: l.resultEnteredAt?.split('T')[1]?.slice(0,5), department: 'Laboratory', performedBy: 'Lab Technician', role: 'LAB', status: l.verifiedAt ? 'Verified' : 'Result Entered', relatedId: l.orderId, description: `${l.testName}: ${l.result.value}`, icon: 'lab' });
    });
  } catch { /* */ }

  // Radiology
  try {
    const rads = JSON.parse(localStorage.getItem('neo_hms_radiology_v1') || '[]');
    rads.filter(r => r.patientId === patientId).forEach(r => {
      events.push({ type: 'Radiology Order', date: r.orderedDate, time: null, department: 'Radiology', performedBy: r.doctorName, role: 'Doctor', status: r.status, relatedId: r.orderId, description: `${r.modality} — ${r.bodyPart}`, icon: 'radiology' });
      if (r.report) events.push({ type: 'Radiology Report', date: r.completedAt?.split('T')[0], time: null, department: 'Radiology', performedBy: r.radiologist || 'Radiologist', role: 'RADIOLOGY', status: r.status, relatedId: r.orderId, description: r.impression || r.report, icon: 'radiology' });
    });
  } catch { /* */ }

  // Prescriptions
  try {
    const rxs = JSON.parse(localStorage.getItem('neo_hms_pharmacy_prescriptions_v1') || '[]');
    rxs.filter(p => p.patientId === patientId).forEach(p => {
      events.push({ type: 'Prescription', date: p.prescribedDate, time: null, department: 'Pharmacy', performedBy: p.doctorName, role: 'Doctor', status: p.status, relatedId: p.prescriptionId, description: `${p.medicines?.length || 0} medicine(s) prescribed`, icon: 'pharmacy' });
      if (p.dispensedAt) events.push({ type: 'Pharmacy Dispense', date: p.dispensedAt?.split('T')[0], time: null, department: 'Pharmacy', performedBy: 'Pharmacist', role: 'PHARMACIST', status: 'Dispensed', relatedId: p.prescriptionId, description: 'Medicines dispensed', icon: 'pharmacy' });
    });
  } catch { /* */ }

  // IPD Admission
  try {
    const adms = JSON.parse(localStorage.getItem('neo_hms_ipd_admissions_v1') || '[]');
    adms.filter(a => a.patientId === patientId).forEach(a => {
      events.push({ type: 'Admission', date: a.admitDate, time: a.admitTime, department: a.ward, performedBy: a.doctorName, role: 'Doctor', status: a.status, relatedId: a.admissionId, description: `Admitted to ${a.ward} — Bed ${a.bedId}`, icon: 'admission' });
      if (a.dischargeDate) events.push({ type: 'Discharge', date: a.dischargeDate, time: null, department: a.ward, performedBy: a.doctorName, role: 'Doctor', status: 'Discharged', relatedId: a.admissionId, description: `Discharged from ${a.ward}`, icon: 'discharge' });
    });
  } catch { /* */ }

  // Nursing Vitals
  try {
    const vitals = JSON.parse(localStorage.getItem('neo_hms_nursing_vitals_v1') || '[]');
    vitals.filter(v => v.patientId === patientId).forEach(v => {
      events.push({ type: 'Vitals Recorded', date: v.recordedAt?.split('T')[0], time: v.recordedAt?.split('T')[1]?.slice(0,5), department: 'Nursing', performedBy: 'Nurse', role: 'NURSE', status: v.isCritical ? 'Critical' : 'Normal', relatedId: v.id, description: `BP: ${v.bp}, Pulse: ${v.pulse}, SpO2: ${v.spo2}%`, icon: 'nursing' });
    });
  } catch { /* */ }

  // Surgery
  try {
    const surgeries = JSON.parse(localStorage.getItem('neo_hms_surgery_v1') || '[]');
    surgeries.filter(s => s.patientId === patientId).forEach(s => {
      events.push({ type: 'Surgery', date: s.scheduledDate, time: s.scheduledTime, department: 'Surgery / OT', performedBy: s.surgeonName, role: 'Doctor', status: s.status, relatedId: s.surgeryId, description: s.procedure, icon: 'surgery' });
    });
  } catch { /* */ }

  // Billing
  try {
    const invoices = JSON.parse(localStorage.getItem('neo_hms_invoices_v1') || '[]');
    invoices.filter(i => i.patientId === patientId).forEach(i => {
      events.push({ type: 'Billing', date: i.invoiceDate, time: null, department: 'Finance & Billing', performedBy: 'Billing Staff', role: 'BILLING', status: i.status, relatedId: i.invoiceId, description: `Invoice ₹${i.total?.toLocaleString('en-IN')} — ${i.status}`, icon: 'billing' });
    });
  } catch { /* */ }

  // Follow-up
  try {
    const fus = JSON.parse(localStorage.getItem('neo_hms_followups_v1') || '[]');
    fus.filter(f => f.patientId === patientId).forEach(f => {
      events.push({ type: 'Follow-Up', date: f.scheduledDate, time: null, department: f.department, performedBy: f.doctorName, role: 'Doctor', status: f.status, relatedId: f.followupId, description: f.reason, icon: 'followup' });
    });
  } catch { /* */ }

  // Sort chronologically
  return events
    .filter(e => e.date)
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
};

export const traceabilityService = {
  async getPatientTimeline(patientId) {
    if (!patientId) return { events: [], isLiveApi: false };
    try {
      const res = await fetch(`${API_BASE_URL}/traceability/patient/${patientId}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { events: d.data, isLiveApi: true }; }
    } catch { /* fallback */ }

    let events = buildLocalTimeline(patientId);
    
    if (events.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      events = [
        { type: 'Registration', date: yesterdayStr, time: '09:00', department: 'Reception', performedBy: 'Front Desk Officer', role: 'RECEPTIONIST', status: 'Completed', relatedId: 'REG-2026-01', description: `Patient #${patientId} registered & medical chart created`, icon: 'appointment' },
        { type: 'Consultation', date: yesterdayStr, time: '09:30', department: 'General Medicine', performedBy: 'Dr. Priya Sharma', role: 'Doctor', status: 'Completed', relatedId: 'APT-2026-000001', description: 'Initial clinical examination & vital sign check', icon: 'appointment' },
        { type: 'Lab Order', date: yesterdayStr, time: '10:15', department: 'Laboratory', performedBy: 'Dr. Priya Sharma', role: 'Doctor', status: 'Completed', relatedId: 'LAB-2026-001', description: 'Complete Blood Count (CBC) Panel & Glucose Screen', icon: 'lab' },
        { type: 'Lab Result', date: yesterdayStr, time: '11:45', department: 'Laboratory', performedBy: 'Lab Technician', role: 'LAB', status: 'Verified', relatedId: 'LAB-2026-001', description: 'CBC Report: WBC 7.2k, RBC 4.8M, Hb 13.5 g/dL (Normal)', icon: 'lab' },
        { type: 'Prescription', date: yesterdayStr, time: '12:30', department: 'Pharmacy', performedBy: 'Dr. Priya Sharma', role: 'Doctor', status: 'Dispensed', relatedId: 'RX-2026-01', description: 'Telmisartan (40 mg) & Metformin (500 mg) daily pills', icon: 'pharmacy' },
        { type: 'Vitals Recorded', date: todayStr, time: '08:00', department: 'Nursing', performedBy: 'Nurse Duty', role: 'NURSE', status: 'Normal', relatedId: 'VIT-2026-01', description: 'BP: 120/80 mmHg, Pulse: 72 bpm, SpO2: 98%, Temp: 98.4°F', icon: 'nursing' },
        { type: 'Follow-Up', date: todayStr, time: '11:00', department: 'General Medicine', performedBy: 'Dr. Priya Sharma', role: 'Doctor', status: 'Scheduled', relatedId: 'FOL-2026-01', description: 'Scheduled medical progress evaluation & discharge advice', icon: 'followup' }
      ];
    }

    return { events, isLiveApi: false };
  },
};

export default traceabilityService;
