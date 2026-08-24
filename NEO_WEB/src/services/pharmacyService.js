// services/pharmacyService.js
// Pharmacy — prescriptions & dispensing — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const PRES_KEY = 'neo_hms_pharmacy_prescriptions_v1';
const HIST_KEY = 'neo_hms_pharmacy_history_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const PRESCRIPTION_STATUSES = ['Pending', 'Partially Dispensed', 'Dispensed', 'Cancelled'];

const SEED_PRESCRIPTIONS = [
  { id: 'RX-2026-001', prescriptionId: 'RX-2026-001', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', prescribedDate: today, status: 'Pending', medicines: [{ name: 'Telmisartan 40mg', dosage: '40mg', frequency: 'Once daily', duration: '30 days', quantity: 30, dispensed: 0 }, { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days', quantity: 30, dispensed: 0 }], notes: 'Hypertension management' },
  { id: 'RX-2026-002', prescriptionId: 'RX-2026-002', patientId: 'P10052', patientName: 'Mohammed Aslam', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', prescribedDate: today, status: 'Dispensed', medicines: [{ name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'SOS', duration: '1 month', quantity: 1, dispensed: 1 }, { name: 'Budesonide Inhaler', dosage: '200mcg', frequency: 'Twice daily', duration: '1 month', quantity: 1, dispensed: 1 }], notes: 'Asthma management', dispensedAt: today, dispensedBy: 'Pharmacy Team' },
  { id: 'RX-2026-003', prescriptionId: 'RX-2026-003', patientId: 'P10041', patientName: 'Meena Devi', doctorId: 'D004', doctorName: 'Dr. Rekha Singh', prescribedDate: today, status: 'Pending', medicines: [{ name: 'Folic Acid 5mg', dosage: '5mg', frequency: 'Once daily', duration: '90 days', quantity: 90, dispensed: 0 }, { name: 'Iron Sucrose 200mg', dosage: '200mg', frequency: 'IV weekly', duration: '4 weeks', quantity: 4, dispensed: 0 }], notes: 'Prenatal supplementation' },
  { id: 'RX-2026-004', prescriptionId: 'RX-2026-004', patientId: 'P10047', patientName: 'Prakash Nair', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', prescribedDate: today, status: 'Partially Dispensed', medicines: [{ name: 'Sumatriptan 50mg', dosage: '50mg', frequency: 'SOS (max 2/day)', duration: '1 month', quantity: 6, dispensed: 3 }, { name: 'Metoclopramide 10mg', dosage: '10mg', frequency: 'SOS', duration: '1 month', quantity: 10, dispensed: 5 }], notes: 'Migraine management' },
];

const getLocal = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveLocal = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const pharmacyService = {
  async getPrescriptions(params = {}) {
    const { search = '', status = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, status, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { prescriptions: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.patientName?.toLowerCase().includes(q) || p.prescriptionId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(p => p.status === status);
    const total = list.length;
    return { prescriptions: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async getPrescriptionById(id) {
    try { const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions/${id}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { prescription: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    const p = list.find(x => x.id === id || x.prescriptionId === id);
    return p ? { prescription: p, isLiveApi: false } : null;
  },

  async dispenseMedicine(prescriptionId, dispensedMeds) {
    const list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    const idx = list.findIndex(p => p.id === prescriptionId || p.prescriptionId === prescriptionId);
    if (idx === -1) throw new Error('Prescription not found');
    try {
      const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions/${prescriptionId}/dispense`, { method: 'POST', headers: h(), body: JSON.stringify({ medicines: dispensedMeds }) });
      if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(PRES_KEY, list); return { success: true, prescription: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    const allFull = dispensedMeds.every(m => m.dispensed >= m.quantity);
    list[idx] = { ...list[idx], medicines: dispensedMeds, status: allFull ? 'Dispensed' : 'Partially Dispensed', dispensedAt: new Date().toISOString(), dispensedBy: 'Pharmacy Team' };
    saveLocal(PRES_KEY, list);
    return { success: true, prescription: list[idx], isLiveApi: false };
  },

  async getHistory(params = {}) {
    const { patientId = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ patientId, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/pharmacy/history?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { history: d.data, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS).filter(p => p.status === 'Dispensed');
    if (patientId) list = list.filter(p => p.patientId === patientId);
    return { history: list, isLiveApi: false };
  },
};

export default pharmacyService;
