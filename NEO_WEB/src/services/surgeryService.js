// services/surgeryService.js
// Surgery / OT management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_surgery_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const SURGERY_STATUSES = ['Requested', 'Scheduled', 'Pre-Op Checklist', 'In Progress', 'Completed', 'Post-Op', 'Cancelled'];
export const OT_ROOMS = ['OT-1 (General)', 'OT-2 (Cardiac)', 'OT-3 (Ortho)', 'OT-4 (Gynaecology)', 'OT-5 (Emergency)'];

const SEED = [
  { id: 'SRG-2026-001', surgeryId: 'SRG-2026-001', patientId: 'P10062', patientName: 'Rajesh Varma', surgeonId: 'D005', surgeonName: 'Dr. Suresh Bhat', procedure: 'Total Hip Replacement', scheduledDate: today, scheduledTime: '06:00', estimatedDuration: 180, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Nair A.', status: 'Post-Op', preOpCompleted: true, intraOpNotes: 'Procedure completed without complications. Cemented stem implanted.', postOpNotes: 'Stable. Pain management in progress. Day 4 post-op.', completedAt: today, assistants: ['Nurse D'] },
  { id: 'SRG-2026-002', surgeryId: 'SRG-2026-002', patientId: 'P10069', patientName: 'Deepa Thomas', surgeonId: 'D001', surgeonName: 'Dr. Priya Sharma', procedure: 'Emergency Appendectomy', scheduledDate: today, scheduledTime: '11:30', estimatedDuration: 60, otRoom: 'OT-5 (Emergency)', anaesthesiologist: 'Dr. Rajan S.', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse A'] },
  { id: 'SRG-2026-003', surgeryId: 'SRG-2026-003', patientId: 'P10033', patientName: 'Sunita Iyer', surgeonId: 'D002', surgeonName: 'Dr. Kiran Rao', procedure: 'Coronary Angioplasty + Stenting', scheduledDate: today, scheduledTime: '09:00', estimatedDuration: 90, otRoom: 'OT-2 (Cardiac)', anaesthesiologist: 'Dr. Nair A.', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Single vessel disease. LAD stented successfully. LVEF improved post-procedure.', postOpNotes: 'Stable in ICU. Monitoring for 24h.', completedAt: today, assistants: ['Nurse B'] },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const surgeryService = {
  async getSurgeries(params = {}) {
    const { search = '', status = '', date = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, status, date, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/surgery?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { surgeries: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.patientName?.toLowerCase().includes(q) || s.procedure?.toLowerCase().includes(q) || s.surgeryId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(s => s.status === status);
    if (date) list = list.filter(s => s.scheduledDate === date);
    return { surgeries: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async scheduleSurgery(data) {
    const list = getLocal();
    const id = `SRG-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, surgeryId: id, ...data, status: 'Scheduled', preOpCompleted: false };
    try { const res = await fetch(`${API_BASE_URL}/surgery`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, surgery: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, surgery: record, isLiveApi: false };
  },

  async updateSurgery(id, updates) {
    const list = getLocal(); const idx = list.findIndex(s => s.id === id || s.surgeryId === id); if (idx === -1) throw new Error('Surgery not found');
    try { const res = await fetch(`${API_BASE_URL}/surgery/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(updates) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, surgery: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...updates };
    if (updates.status === 'Completed') list[idx].completedAt = new Date().toISOString();
    saveLocal(list);
    return { success: true, surgery: list[idx], isLiveApi: false };
  },
};

export default surgeryService;
