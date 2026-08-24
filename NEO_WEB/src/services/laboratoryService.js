// services/laboratoryService.js
// Laboratory module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_lab_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];

export const LAB_TEST_TYPES = ['CBC', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Profile', 'Urine Routine', 'Culture & Sensitivity', 'Troponin I', 'D-Dimer', 'HbA1c', 'ESR', 'CRP', 'Electrolytes', 'Blood Group & Cross-match'];
export const LAB_ORDER_STATUSES = ['Pending', 'Sample Collected', 'Processing', 'Result Entered', 'Verified', 'Completed', 'Cancelled'];
export const SAMPLE_TYPES = ['Blood', 'Urine', 'Stool', 'Sputum', 'Swab', 'CSF', 'Tissue'];
export const URGENCY_TYPES = ['Routine', 'Urgent', 'STAT'];

const SEED_ORDERS = [
  { id: 'LAB-2026-001', orderId: 'LAB-2026-001', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', testName: 'CBC', sampleType: 'Blood', urgency: 'Routine', status: 'Completed', orderedDate: today, sampleCollectedAt: today + 'T08:30:00', resultEnteredAt: today + 'T10:00:00', verifiedAt: today + 'T10:30:00', result: { value: 'Normal', report: 'WBC 7.2k, RBC 4.8M, Hb 13.5g/dL, Platelets 220k' }, department: 'General Medicine', notes: '' },
  { id: 'LAB-2026-002', orderId: 'LAB-2026-002', patientId: 'P10033', patientName: 'Sunita Iyer', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', testName: 'Troponin I', sampleType: 'Blood', urgency: 'STAT', status: 'Processing', orderedDate: today, sampleCollectedAt: today + 'T08:52:00', result: null, department: 'Cardiology', notes: 'STAT — AMI suspected' },
  { id: 'LAB-2026-003', orderId: 'LAB-2026-003', patientId: 'P10033', patientName: 'Sunita Iyer', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', testName: 'Lipid Profile', sampleType: 'Blood', urgency: 'STAT', status: 'Processing', orderedDate: today, sampleCollectedAt: today + 'T08:55:00', result: null, department: 'Cardiology', notes: '' },
  { id: 'LAB-2026-004', orderId: 'LAB-2026-004', patientId: 'P10041', patientName: 'Meena Devi', doctorId: 'D004', doctorName: 'Dr. Rekha Singh', testName: 'Urine Routine', sampleType: 'Urine', urgency: 'Routine', status: 'Pending', orderedDate: today, sampleCollectedAt: null, result: null, department: 'Maternity & Gynaecology', notes: '' },
  { id: 'LAB-2026-005', orderId: 'LAB-2026-005', patientId: 'P10047', patientName: 'Prakash Nair', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', testName: 'ESR', sampleType: 'Blood', urgency: 'Urgent', status: 'Sample Collected', orderedDate: today, sampleCollectedAt: today + 'T09:45:00', result: null, department: 'Neurology', notes: '' },
  { id: 'LAB-2026-006', orderId: 'LAB-2026-006', patientId: 'P10052', patientName: 'Mohammed Aslam', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', testName: 'Blood Sugar', sampleType: 'Blood', urgency: 'Routine', status: 'Completed', orderedDate: today, sampleCollectedAt: today + 'T09:00:00', resultEnteredAt: today + 'T10:30:00', verifiedAt: today + 'T11:00:00', result: { value: 'High', report: 'Random Blood Sugar: 182 mg/dL (High)' }, department: 'General Medicine', notes: '' },
];

const getLocal = () => {
  try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ }
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED_ORDERS));
  return SEED_ORDERS;
};
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };

const headers = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const laboratoryService = {
  async getLabOrders(params = {}) {
    const { search = '', status = '', urgency = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, status, urgency, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/lab/orders?${q}`, { headers: headers() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { orders: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* fallback */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(o => o.patientName?.toLowerCase().includes(q) || o.testName?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(o => o.status === status);
    if (urgency && urgency !== 'All') list = list.filter(o => o.urgency === urgency);
    const total = list.length;
    return { orders: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async getLabOrderById(id) {
    try { const res = await fetch(`${API_BASE_URL}/lab/orders/${id}`, { headers: headers() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { order: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal();
    const order = list.find(o => o.id === id || o.orderId === id);
    return order ? { order, isLiveApi: false } : null;
  },

  async createLabOrder(data) {
    const list = getLocal();
    const id = `LAB-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, orderId: id, ...data, status: 'Pending', orderedDate: new Date().toISOString().split('T')[0], sampleCollectedAt: null, result: null };
    try {
      const res = await fetch(`${API_BASE_URL}/lab/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, order: record, isLiveApi: false };
  },

  async updateLabOrder(id, updates) {
    const list = getLocal();
    const idx = list.findIndex(o => o.id === id || o.orderId === id);
    if (idx === -1) throw new Error('Lab order not found');
    try {
      const res = await fetch(`${API_BASE_URL}/lab/orders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(updates) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list[idx] = { ...list[idx], ...updates };
    saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async collectSample(id) {
    return this.updateLabOrder(id, { status: 'Sample Collected', sampleCollectedAt: new Date().toISOString() });
  },

  async enterResult(id, result) {
    return this.updateLabOrder(id, { status: 'Result Entered', result, resultEnteredAt: new Date().toISOString() });
  },

  async verifyResult(id) {
    return this.updateLabOrder(id, { status: 'Verified', verifiedAt: new Date().toISOString() });
  },

  async completeOrder(id) {
    return this.updateLabOrder(id, { status: 'Completed' });
  },

  async getPatientLabHistory(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/lab/patient/${patientId}`, { headers: headers() }); if (res.ok) { const d = await res.json(); if (d.success) return { orders: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal();
    return { orders: list.filter(o => o.patientId === patientId), isLiveApi: false };
  },
};

export default laboratoryService;
