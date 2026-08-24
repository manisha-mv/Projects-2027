// services/bloodBankService.js
// Blood Bank — inventory, requests, issuance — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const INV_KEY = 'neo_hms_blood_inventory_v1';
const REQ_KEY = 'neo_hms_blood_requests_v1';
const token = () => localStorage.getItem('neohms_token');
const today = new Date().toISOString().split('T')[0];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const REQUEST_STATUSES = ['Pending', 'Approved', 'Issued', 'Rejected', 'Returned'];

const SEED_INVENTORY = [
  { bloodGroup: 'A+',  units: 12, reserved: 2, available: 10, expiryDates: ['2026-09-01', '2026-09-05', '2026-09-10'], lastUpdated: today },
  { bloodGroup: 'A-',  units: 4,  reserved: 0, available: 4,  expiryDates: ['2026-09-08'],                              lastUpdated: today },
  { bloodGroup: 'B+',  units: 18, reserved: 3, available: 15, expiryDates: ['2026-09-03', '2026-09-07'],               lastUpdated: today },
  { bloodGroup: 'B-',  units: 2,  reserved: 1, available: 1,  expiryDates: ['2026-09-04'],                              lastUpdated: today },
  { bloodGroup: 'AB+', units: 6,  reserved: 0, available: 6,  expiryDates: ['2026-09-12'],                             lastUpdated: today },
  { bloodGroup: 'AB-', units: 1,  reserved: 0, available: 1,  expiryDates: ['2026-09-06'],                              lastUpdated: today },
  { bloodGroup: 'O+',  units: 25, reserved: 4, available: 21, expiryDates: ['2026-09-01', '2026-09-02', '2026-09-09'], lastUpdated: today },
  { bloodGroup: 'O-',  units: 3,  reserved: 2, available: 1,  expiryDates: ['2026-09-05'],                              lastUpdated: today },
];

const SEED_REQUESTS = [
  { id: 'BR-001', requestId: 'BR-001', patientId: 'P10033', patientName: 'Sunita Iyer', bloodGroup: 'AB+', units: 2, urgency: 'STAT', requestedBy: 'Dr. Kiran Rao', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'AMI — possible transfusion' },
  { id: 'BR-002', requestId: 'BR-002', patientId: 'P10062', patientName: 'Rajesh Varma', bloodGroup: 'O+', units: 1, urgency: 'Routine', requestedBy: 'Dr. Suresh Bhat', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Post hip replacement' },
];

const getL = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveL = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const bloodBankService = {
  async getInventory() {
    try { const res = await fetch(`${API_BASE_URL}/blood-bank/inventory`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { inventory: d.data, isLiveApi: true }; } } catch { /* */ }
    return { inventory: getL(INV_KEY, SEED_INVENTORY), isLiveApi: false };
  },

  async updateUnits(bloodGroup, delta, notes = '') {
    try { const res = await fetch(`${API_BASE_URL}/blood-bank/inventory/${bloodGroup}`, { method: 'PUT', headers: h(), body: JSON.stringify({ delta, notes }) }); if (res.ok) { return { success: true, isLiveApi: true }; } } catch { /* */ }
    const list = getL(INV_KEY, SEED_INVENTORY);
    const idx = list.findIndex(b => b.bloodGroup === bloodGroup);
    if (idx === -1) throw new Error('Blood group not found');
    const newUnits = Math.max(0, list[idx].units + delta);
    list[idx] = { ...list[idx], units: newUnits, available: Math.max(0, list[idx].available + delta), lastUpdated: today };
    saveL(INV_KEY, list);
    return { success: true, isLiveApi: false };
  },

  async getRequests(params = {}) {
    const { status = '' } = params;
    try { const res = await fetch(`${API_BASE_URL}/blood-bank/requests${status ? `?status=${status}` : ''}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { requests: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getL(REQ_KEY, SEED_REQUESTS);
    if (status && status !== 'All') list = list.filter(r => r.status === status);
    return { requests: list, isLiveApi: false };
  },

  async requestBlood(data) {
    const list = getL(REQ_KEY, SEED_REQUESTS);
    const id = `BR-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, requestId: id, ...data, requestedAt: today, status: 'Pending' };
    try { const res = await fetch(`${API_BASE_URL}/blood-bank/requests`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveL(REQ_KEY, list); return { success: true, request: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveL(REQ_KEY, list);
    return { success: true, request: record, isLiveApi: false };
  },

  async issueBlood(requestId) {
    const list = getL(REQ_KEY, SEED_REQUESTS);
    const idx = list.findIndex(r => r.id === requestId || r.requestId === requestId);
    if (idx === -1) throw new Error('Request not found');
    list[idx] = { ...list[idx], status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank' };
    await this.updateUnits(list[idx].bloodGroup, -list[idx].units, `Issued for ${list[idx].patientName}`);
    saveL(REQ_KEY, list);
    return { success: true, request: list[idx], isLiveApi: false };
  },
};

export default bloodBankService;
