// services/followupService.js
// Follow-up management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_followups_v1';
const token = () => localStorage.getItem('neohms_token');
const today = new Date().toISOString().split('T')[0];
const futureDate = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };

export const FOLLOWUP_STATUSES = ['Upcoming', 'Overdue', 'Completed', 'Cancelled'];

const SEED = [
  { id: 'FU-001', followupId: 'FU-001', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', department: 'General Medicine', scheduledDate: futureDate(14), status: 'Upcoming', reason: 'BP follow-up post-discharge', appointmentId: null, notes: 'Check if BP is controlled on current meds', completedAt: null },
  { id: 'FU-002', followupId: 'FU-002', patientId: 'P10011', patientName: 'Kavitha Rao', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', department: 'General Medicine', scheduledDate: today, status: 'Upcoming', reason: 'Thyroid hormone check post viral fever', appointmentId: null, notes: '', completedAt: null },
  { id: 'FU-003', followupId: 'FU-003', patientId: 'P10067', patientName: 'Rajesh Nair', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', department: 'Cardiology', scheduledDate: futureDate(-3), status: 'Overdue', reason: 'Cardiology routine follow-up — Lipid profile review', appointmentId: null, notes: 'Patient rescheduled twice', completedAt: null },
  { id: 'FU-004', followupId: 'FU-004', patientId: 'P10052', patientName: 'Mohammed Aslam', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', department: 'General Medicine', scheduledDate: futureDate(-10), status: 'Completed', reason: 'Asthma follow-up', appointmentId: null, notes: 'Inhaler technique reviewed. Stable.', completedAt: futureDate(-10) },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const followupService = {
  async getFollowups(params = {}) {
    const { status = '', search = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ status, search, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/followup?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { followups: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    // Auto-mark overdue
    list = list.map(f => f.status === 'Upcoming' && f.scheduledDate < today ? { ...f, status: 'Overdue' } : f);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(f => f.patientName?.toLowerCase().includes(q) || f.followupId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(f => f.status === status);
    return { followups: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async createFollowup(data) {
    const list = getLocal();
    const id = `FU-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, followupId: id, ...data, status: 'Upcoming' };
    try { const res = await fetch(`${API_BASE_URL}/followup`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, followup: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, followup: record, isLiveApi: false };
  },

  async markComplete(id, notes = '') {
    const list = getLocal(); const idx = list.findIndex(f => f.id === id || f.followupId === id); if (idx === -1) throw new Error('Follow-up not found');
    list[idx] = { ...list[idx], status: 'Completed', completedAt: today, notes: notes || list[idx].notes };
    saveLocal(list);
    return { success: true, followup: list[idx], isLiveApi: false };
  },
};

export default followupService;
