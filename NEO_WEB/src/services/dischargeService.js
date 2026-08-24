// services/dischargeService.js
// Discharge management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_discharges_v1';
const token = () => localStorage.getItem('neohms_token');
const today = new Date().toISOString().split('T')[0];

export const DISCHARGE_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const SEED = [
  { id: 'DSC-2026-001', dischargeId: 'DSC-2026-001', admissionId: 'ADM-001', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', status: 'Pending', scheduledDate: today, actualDischargeDate: null, diagnosis: 'Essential Hypertension', treatment: 'IV Labetalol, oral antihypertensives commenced', dischargeType: 'Regular', medications: [{ name: 'Telmisartan 40mg', dosage: '40mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }], instructions: 'Low sodium diet. Avoid stress. Follow-up in 2 weeks.', followUpDate: null, summary: '' },
  { id: 'DSC-2026-002', dischargeId: 'DSC-2026-002', admissionId: 'ADM-003', patientId: 'P10047', patientName: 'Prakash Nair', ward: 'Neurology', bed: 'NEU-07', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', status: 'In Progress', scheduledDate: today, actualDischargeDate: null, diagnosis: 'Chronic Migraine — Acute Exacerbation', treatment: 'IV Sumatriptan, Metoclopramide, Hydration', dischargeType: 'Regular', medications: [{ name: 'Sumatriptan 50mg', dosage: '50mg', frequency: 'SOS', duration: '1 month' }], instructions: 'Maintain headache diary. Avoid triggers (stress, lack of sleep). Follow-up in 1 month.', followUpDate: null, summary: '' },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const dischargeService = {
  async getDischarges(params = {}) {
    const { status = '', search = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ status, search, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/discharge?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { discharges: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(d => d.patientName?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(d => d.status === status);
    return { discharges: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async updateDischarge(id, updates) {
    const list = getLocal(); const idx = list.findIndex(d => d.id === id || d.dischargeId === id); if (idx === -1) throw new Error('Not found');
    try { const res = await fetch(`${API_BASE_URL}/discharge/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(updates) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, discharge: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...updates };
    if (updates.status === 'Completed') list[idx].actualDischargeDate = today;
    saveLocal(list);
    return { success: true, discharge: list[idx], isLiveApi: false };
  },
};

export default dischargeService;
