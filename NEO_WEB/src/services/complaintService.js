// services/complaintService.js
// Complaint management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_complaints_v1';
const token = () => localStorage.getItem('neohms_token');
const today = new Date().toISOString().split('T')[0];

export const COMPLAINT_STATUSES  = ['Open', 'Under Investigation', 'Resolved', 'Escalated', 'Closed'];
export const COMPLAINT_CATEGORIES = ['Staff Behaviour', 'Waiting Time', 'Hygiene', 'Billing Issue', 'Clinical Care', 'Facilities', 'Pharmacy', 'Other'];
export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const SEED = [
  { id: 'CMP-2026-001', complaintId: 'CMP-2026-001', patientId: 'P10025', patientName: 'Arun Kumar', category: 'Waiting Time', priority: 'Medium', subject: 'Long wait in OPD', description: 'Waited for 2 hours in OPD without any update on appointment status.', status: 'Under Investigation', submittedDate: today, assignedTo: 'Complaint Officer', investigationNotes: 'Spoke with OPD in-charge.', resolution: null, closedDate: null },
  { id: 'CMP-2026-002', complaintId: 'CMP-2026-002', patientId: 'P10041', patientName: 'Meena Devi', category: 'Staff Behaviour', priority: 'High', subject: 'Rude behavior from ward nurse', description: 'Nurse on duty in Ward 3B was dismissive and rude during morning round.', status: 'Escalated', submittedDate: today, assignedTo: 'Complaint Officer', investigationNotes: 'Escalated to Head Nurse.', resolution: null, closedDate: null },
  { id: 'CMP-2026-003', complaintId: 'CMP-2026-003', patientId: null, patientName: 'Anonymous', category: 'Hygiene', priority: 'Medium', subject: 'Unclean washroom in Ward 2A', description: 'Washrooms on Ward 2A floor were not cleaned for over 6 hours.', status: 'Resolved', submittedDate: today, assignedTo: 'Complaint Officer', investigationNotes: 'Housekeeping team notified.', resolution: 'Immediate cleaning done. Housekeeping schedule adjusted.', closedDate: today },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const complaintService = {
  async getComplaints(params = {}) {
    const { search = '', status = '', category = '', priority = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, status, category, priority, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/complaints?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { complaints: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(c => c.subject?.toLowerCase().includes(q) || c.patientName?.toLowerCase().includes(q) || c.complaintId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(c => c.status === status);
    if (category && category !== 'All') list = list.filter(c => c.category === category);
    if (priority && priority !== 'All') list = list.filter(c => c.priority === priority);
    return { complaints: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async createComplaint(data) {
    const list = getLocal();
    const id = `CMP-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, complaintId: id, ...data, status: 'Open', submittedDate: today };
    try { const res = await fetch(`${API_BASE_URL}/complaints`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, complaint: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, complaint: record, isLiveApi: false };
  },

  async updateComplaint(id, updates) {
    const list = getLocal(); const idx = list.findIndex(c => c.id === id || c.complaintId === id); if (idx === -1) throw new Error('Complaint not found');
    list[idx] = { ...list[idx], ...updates };
    if (updates.status === 'Resolved' || updates.status === 'Closed') list[idx].closedDate = today;
    saveLocal(list);
    return { success: true, complaint: list[idx], isLiveApi: false };
  },
};

export default complaintService;
