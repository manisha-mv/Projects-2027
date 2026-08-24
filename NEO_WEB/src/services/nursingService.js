// services/nursingService.js
// Nursing module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const VITALS_KEY = 'neo_hms_nursing_vitals_v1';
const NOTES_KEY  = 'neo_hms_nursing_notes_v1';
const TASKS_KEY  = 'neo_hms_nursing_tasks_v1';
const token = () => localStorage.getItem('neohms_token');
const now = () => new Date().toISOString();

const SEED_TASKS = [
  { id: 'MT-001', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Telmisartan 40mg', dosage: '40mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: '' },
  { id: 'MT-002', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Amlodipine 5mg', dosage: '5mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: '' },
  { id: 'MT-003', patientId: 'P10033', patientName: 'Sunita Iyer', ward: 'Cardiology ICU', bed: 'CAR-02', medicine: 'Heparin 5000 IU', dosage: '5000 IU', route: 'IV', scheduledTime: '10:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Verify coagulation before giving' },
  { id: 'MT-004', patientId: 'P10047', patientName: 'Prakash Nair', ward: 'Neurology', bed: 'NEU-07', medicine: 'Sumatriptan 50mg', dosage: '50mg', route: 'Oral', scheduledTime: '11:00', status: 'Pending', completedAt: null, givenBy: null, notes: '' },
  { id: 'MT-005', patientId: 'P10069', patientName: 'Deepa Thomas', ward: 'Emergency', bed: 'E-07', medicine: 'Ondansetron 4mg', dosage: '4mg', route: 'IV', scheduledTime: '09:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: '' },
];

const SEED_VITALS = [
  { id: 'V-001', patientId: 'P10025', patientName: 'Arun Kumar', bp: '140/90', pulse: 78, temp: 98.6, spo2: 97, rr: 18, weight: null, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Post-morning round' },
  { id: 'V-002', patientId: 'P10033', patientName: 'Sunita Iyer', bp: '90/60', pulse: 102, temp: 99.2, spo2: 94, rr: 22, weight: null, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Critical — Dr. Kiran alerted', isCritical: true },
  { id: 'V-003', patientId: 'P10047', patientName: 'Prakash Nair', bp: '130/85', pulse: 72, temp: 98.4, spo2: 98, rr: 16, weight: null, recordedAt: now(), recordedBy: 'Nurse Station', notes: '' },
];

const getLocal = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveLocal = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const nursingService = {
  async getAssignedPatients() {
    try { const res = await fetch(`${API_BASE_URL}/nursing/patients`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { patients: d.data, isLiveApi: true }; } } catch { /* */ }
    // Build from tasks
    const tasks = getLocal(TASKS_KEY, SEED_TASKS);
    const map = {};
    tasks.forEach(t => { if (!map[t.patientId]) map[t.patientId] = { patientId: t.patientId, patientName: t.patientName, ward: t.ward, bed: t.bed, pendingTasks: 0 }; if (t.status === 'Pending') map[t.patientId].pendingTasks++; });
    return { patients: Object.values(map), isLiveApi: false };
  },

  async getMedicationTasks(params = {}) {
    const { status = '', patientId = '' } = params;
    try { const q = new URLSearchParams({ status, patientId }).toString(); const res = await fetch(`${API_BASE_URL}/nursing/tasks?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { tasks: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal(TASKS_KEY, SEED_TASKS);
    if (status && status !== 'All') list = list.filter(t => t.status === status);
    if (patientId) list = list.filter(t => t.patientId === patientId);
    return { tasks: list, isLiveApi: false };
  },

  async completeTask(id, notes = '') {
    const list = getLocal(TASKS_KEY, SEED_TASKS); const idx = list.findIndex(t => t.id === id); if (idx === -1) throw new Error('Task not found');
    try { const res = await fetch(`${API_BASE_URL}/nursing/tasks/${id}/complete`, { method: 'PUT', headers: h(), body: JSON.stringify({ notes }) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(TASKS_KEY, list); return { success: true, task: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], status: 'Completed', completedAt: now(), notes };
    saveLocal(TASKS_KEY, list);
    return { success: true, task: list[idx], isLiveApi: false };
  },

  async recordVitals(data) {
    const list = getLocal(VITALS_KEY, SEED_VITALS);
    const id = `V-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, ...data, recordedAt: now() };
    const isCritical = (data.spo2 && data.spo2 < 92) || (data.pulse && (data.pulse < 50 || data.pulse > 120));
    if (isCritical) record.isCritical = true;
    try { const res = await fetch(`${API_BASE_URL}/nursing/vitals`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(VITALS_KEY, list); return { success: true, vitals: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(VITALS_KEY, list);
    return { success: true, vitals: record, isLiveApi: false };
  },

  async getVitals(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/nursing/vitals?patientId=${patientId}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { vitals: d.data, isLiveApi: true }; } } catch { /* */ }
    return { vitals: getLocal(VITALS_KEY, SEED_VITALS).filter(v => v.patientId === patientId), isLiveApi: false };
  },

  async addNote(data) {
    const list = getLocal(NOTES_KEY, []);
    const id = `NN-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, ...data, recordedAt: now() };
    try { const res = await fetch(`${API_BASE_URL}/nursing/notes`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(NOTES_KEY, list); return { success: true, note: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(NOTES_KEY, list);
    return { success: true, note: record, isLiveApi: false };
  },

  async getNotes(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/nursing/notes?patientId=${patientId}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { notes: d.data, isLiveApi: true }; } } catch { /* */ }
    return { notes: getLocal(NOTES_KEY, []).filter(n => n.patientId === patientId), isLiveApi: false };
  },
};

export default nursingService;
