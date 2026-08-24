// services/emergencyService.js
// Emergency Department — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_emergency_v1';
const token = () => localStorage.getItem('neohms_token');

const now = () => new Date().toISOString();
export const TRIAGE_LEVELS = ['P1 - Critical', 'P2 - Urgent', 'P3 - Semi-Urgent', 'P4 - Non-Urgent'];
export const EMERGENCY_STATUSES = ['Registered', 'Triaged', 'Under Treatment', 'Admitted', 'Discharged', 'Referred', 'Expired'];

const SEED = [
  { id: 'EM-2026-001', emergencyId: 'EM-2026-001', patientId: 'P10069', patientName: 'Deepa Thomas', age: 31, gender: 'Female', phone: '+91 97400 11223', arrivalTime: now(), chiefComplaint: 'Severe abdominal pain, vomiting', triage: 'P1 - Critical', status: 'Admitted', assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-07', treatment: 'IV Fluids, Analgesics, USG Abdomen ordered', admittedAt: now(), notes: 'Emergency admission — Acute Appendicitis' },
  { id: 'EM-2026-002', emergencyId: 'EM-2026-002', patientId: null, patientName: 'Unidentified Male', age: 45, gender: 'Male', phone: null, arrivalTime: now(), chiefComplaint: 'RTA — Head Injury', triage: 'P1 - Critical', status: 'Under Treatment', assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-08', treatment: 'CT Brain ordered, Stabilization in progress', notes: 'Brought by ambulance, no ID' },
  { id: 'EM-2026-003', emergencyId: 'EM-2026-003', patientId: 'P10025', patientName: 'Arun Kumar', age: 42, gender: 'Male', phone: '+91 98450 12345', arrivalTime: now(), chiefComplaint: 'BP spike — 200/110, headache', triage: 'P2 - Urgent', status: 'Discharged', assignedDoctor: 'Dr. Priya Sharma', bedId: null, treatment: 'IV Labetalol, monitoring, discharged after stabilization', dischargedAt: now(), notes: '' },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const emergencyService = {
  async getPatients(params = {}) {
    const { search = '', status = '', triage = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, status, triage, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/emergency/patients?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { patients: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(e => e.patientName?.toLowerCase().includes(q) || e.emergencyId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(e => e.status === status);
    if (triage && triage !== 'All') list = list.filter(e => e.triage === triage);
    return { patients: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async registerEmergency(data) {
    const list = getLocal();
    const id = `EM-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, emergencyId: id, ...data, arrivalTime: now(), status: 'Registered' };
    try { const res = await fetch(`${API_BASE_URL}/emergency/patients`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, patient: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, patient: record, isLiveApi: false };
  },

  async updateTriage(id, triage, notes = '') {
    const list = getLocal(); const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Emergency patient not found');
    list[idx] = { ...list[idx], triage, notes: notes || list[idx].notes, status: list[idx].status === 'Registered' ? 'Triaged' : list[idx].status, triagedAt: now() };
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status, extra = {}) {
    const list = getLocal(); const idx = list.findIndex(e => e.id === id); if (idx === -1) throw new Error('Not found');
    list[idx] = { ...list[idx], status, ...extra };
    if (status === 'Discharged') list[idx].dischargedAt = now();
    if (status === 'Admitted') list[idx].admittedAt = now();
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },
};

export default emergencyService;
