// services/radiologyService.js
// Radiology module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_radiology_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const RADIOLOGY_MODALITIES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Echocardiography', 'PET Scan', 'Mammography', 'Fluoroscopy', 'DEXA Scan'];
export const RADIOLOGY_STATUSES  = ['Ordered', 'Scheduled', 'In Progress', 'Scan Completed', 'Report Entered', 'Verified', 'Cancelled'];

const SEED = [
  { id: 'RAD-2026-001', orderId: 'RAD-2026-001', patientId: 'P10047', patientName: 'Prakash Nair', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', modality: 'CT Scan', bodyPart: 'Brain', urgency: 'Urgent', status: 'Scan Completed', orderedDate: today, scheduledDate: today, scheduledTime: '09:45 AM', completedAt: today + 'T10:30:00', report: null, impression: null, technician: 'Mr. Ravi T', radiologist: null, notes: 'Migraine — rule out bleed' },
  { id: 'RAD-2026-002', orderId: 'RAD-2026-002', patientId: 'P10033', patientName: 'Sunita Iyer', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', modality: 'Echocardiography', bodyPart: 'Heart', urgency: 'STAT', status: 'Report Entered', orderedDate: today, scheduledDate: today, scheduledTime: '08:30 AM', completedAt: today + 'T09:00:00', report: 'LVEF 45% — reduced. Wall motion abnormality noted in LAD territory.', impression: 'Anterior wall hypokinesia. Consistent with AMI.', technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R', notes: '' },
  { id: 'RAD-2026-003', orderId: 'RAD-2026-003', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'X-Ray', bodyPart: 'Chest', urgency: 'Routine', status: 'Verified', orderedDate: today, scheduledDate: today, scheduledTime: '10:00 AM', completedAt: today + 'T10:20:00', report: 'Cardiomegaly noted. No consolidation.', impression: 'Cardiomegaly. Follow-up recommended.', technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R', notes: '' },
  { id: 'RAD-2026-004', orderId: 'RAD-2026-004', patientId: 'P10069', patientName: 'Deepa Thomas', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'Ultrasound', bodyPart: 'Abdomen', urgency: 'STAT', status: 'In Progress', orderedDate: today, scheduledDate: today, scheduledTime: '10:45 AM', completedAt: null, report: null, impression: null, technician: 'Mr. Kumar S', radiologist: null, notes: 'Acute abdomen — rule out appendicitis' },
  { id: 'RAD-2026-005', orderId: 'RAD-2026-005', patientId: 'P10052', patientName: 'Mohammed Aslam', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'X-Ray', bodyPart: 'Chest', urgency: 'Routine', status: 'Ordered', orderedDate: today, scheduledDate: null, scheduledTime: null, completedAt: null, report: null, impression: null, technician: null, radiologist: null, notes: 'Asthma follow-up' },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const radiologyService = {
  async getOrders(params = {}) {
    const { search = '', status = '', modality = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, status, modality, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/radiology/orders?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { orders: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(o => o.patientName?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(o => o.status === status);
    if (modality && modality !== 'All') list = list.filter(o => o.modality === modality);
    const total = list.length;
    return { orders: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async scheduleOrder(id, data) {
    const list = getLocal(); const idx = list.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders/${id}/schedule`, { method: 'PUT', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...data, status: 'Scheduled' }; saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status, extra = {}) {
    const list = getLocal(); const idx = list.findIndex(o => o.id === id); if (idx === -1) throw new Error('Order not found');
    const updates = { status, ...extra };
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(updates) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...updates }; saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async enterReport(id, report, impression) {
    return this.updateStatus(id, 'Report Entered', { report, impression, reportedAt: new Date().toISOString() });
  },

  async verifyReport(id, radiologist) {
    return this.updateStatus(id, 'Verified', { radiologist, verifiedAt: new Date().toISOString() });
  },

  async createOrder(data) {
    const list = getLocal();
    const id = `RAD-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, orderId: id, ...data, status: 'Ordered', orderedDate: new Date().toISOString().split('T')[0], report: null, impression: null };
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, order: record, isLiveApi: false };
  },

  async getPatientHistory(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/radiology/patient/${patientId}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success) return { orders: d.data, isLiveApi: true }; } } catch { /* */ }
    return { orders: getLocal().filter(o => o.patientId === patientId), isLiveApi: false };
  },
};

export default radiologyService;
