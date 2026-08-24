// services/insuranceService.js
// Insurance claims & policies — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const CLAIMS_KEY  = 'neo_hms_insurance_claims_v1';
const POLICIES_KEY = 'neo_hms_insurance_policies_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const CLAIM_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Paid'];
export const INSURANCE_PROVIDERS = ['Star Health', 'HDFC Ergo', 'ICICI Lombard', 'New India Assurance', 'United India', 'Bajaj Allianz', 'Niva Bupa', 'Government CGHS', 'ESI'];

const SEED_CLAIMS = [
  { id: 'CLM-2026-001', claimId: 'CLM-2026-001', patientId: 'P10033', patientName: 'Sunita Iyer', invoiceId: 'INV-2026-002', provider: 'Star Health', policyNo: 'SH-2024-789012', claimAmount: 142000, approvedAmount: null, status: 'Under Review', submittedDate: today, reviewedDate: null, paymentDate: null, notes: 'AMI — Angioplasty claim', documents: ['Discharge Summary', 'Investigation Reports', 'OT Notes'] },
  { id: 'CLM-2026-002', claimId: 'CLM-2026-002', patientId: 'P10025', patientName: 'Arun Kumar', invoiceId: 'INV-2026-001', provider: 'HDFC Ergo', policyNo: 'HE-2023-456789', claimAmount: 3040, approvedAmount: 2500, status: 'Approved', submittedDate: today, reviewedDate: today, paymentDate: null, notes: 'Hypertension management', documents: ['Admission Record', 'Lab Reports'] },
  { id: 'CLM-2026-003', claimId: 'CLM-2026-003', patientId: 'P10062', patientName: 'Rajesh Varma', invoiceId: null, provider: 'ICICI Lombard', policyNo: 'IL-2025-112233', claimAmount: 85000, approvedAmount: null, status: 'Submitted', submittedDate: today, reviewedDate: null, paymentDate: null, notes: 'Hip Replacement', documents: ['Surgical Notes'] },
];

const SEED_POLICIES = [
  { id: 'POL-001', policyId: 'POL-001', patientId: 'P10033', patientName: 'Sunita Iyer', provider: 'Star Health', policyNo: 'SH-2024-789012', coverAmount: 500000, usedAmount: 142000, validFrom: '2024-01-01', validTo: '2025-12-31', status: 'Active' },
  { id: 'POL-002', policyId: 'POL-002', patientId: 'P10025', patientName: 'Arun Kumar', provider: 'HDFC Ergo', policyNo: 'HE-2023-456789', coverAmount: 300000, usedAmount: 3040, validFrom: '2023-06-01', validTo: '2026-05-31', status: 'Active' },
];

const getL = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveL = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const insuranceService = {
  async getClaims(params = {}) {
    const { search = '', status = '', provider = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, status, provider, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/insurance/claims?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { claims: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getL(CLAIMS_KEY, SEED_CLAIMS);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(c => c.patientName?.toLowerCase().includes(q) || c.claimId?.toLowerCase().includes(q) || c.policyNo?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(c => c.status === status);
    if (provider && provider !== 'All') list = list.filter(c => c.provider === provider);
    return { claims: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async submitClaim(data) {
    const list = getL(CLAIMS_KEY, SEED_CLAIMS);
    const id = `CLM-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, claimId: id, ...data, status: 'Submitted', submittedDate: today };
    try { const res = await fetch(`${API_BASE_URL}/insurance/claims`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveL(CLAIMS_KEY, list); return { success: true, claim: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveL(CLAIMS_KEY, list);
    return { success: true, claim: record, isLiveApi: false };
  },

  async updateClaimStatus(id, status, approvedAmount = null, notes = '') {
    const list = getL(CLAIMS_KEY, SEED_CLAIMS);
    const idx = list.findIndex(c => c.id === id || c.claimId === id);
    if (idx === -1) throw new Error('Claim not found');
    list[idx] = { ...list[idx], status, approvedAmount: approvedAmount ?? list[idx].approvedAmount, notes: notes || list[idx].notes, reviewedDate: today };
    if (status === 'Paid') list[idx].paymentDate = today;
    saveL(CLAIMS_KEY, list);
    return { success: true, claim: list[idx], isLiveApi: false };
  },

  async getPolicies(patientId = '') {
    try { const q = patientId ? `?patientId=${patientId}` : ''; const res = await fetch(`${API_BASE_URL}/insurance/policies${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { policies: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getL(POLICIES_KEY, SEED_POLICIES);
    if (patientId) list = list.filter(p => p.patientId === patientId);
    return { policies: list, isLiveApi: false };
  },
};

export default insuranceService;
