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
  {
    "id": "CLM-2026-101",
    "claimId": "CLM-2026-101",
    "patientId": "P10025",
    "patientName": "Arun Kumar",
    "insuranceProvider": "Star Health Insurance",
    "policyNumber": "POL-889900",
    "claimAmount": 15000,
    "approvedAmount": 12000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99880",
    "notes": "Pre-authorization for Essential Hypertension"
  },
  {
    "id": "CLM-2026-102",
    "claimId": "CLM-2026-102",
    "patientId": "P10041",
    "patientName": "Meena Devi",
    "insuranceProvider": "HDFC ERGO Health",
    "policyNumber": "POL-889901",
    "claimAmount": 18500,
    "approvedAmount": 0,
    "status": "Pre-Auth Pending",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99881",
    "notes": "Pre-authorization for Gestational Diabetes"
  },
  {
    "id": "CLM-2026-103",
    "claimId": "CLM-2026-103",
    "patientId": "P10067",
    "patientName": "Rajesh Nair",
    "insuranceProvider": "ICICI Lombard",
    "policyNumber": "POL-889902",
    "claimAmount": 22000,
    "approvedAmount": 0,
    "status": "Under Review",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99882",
    "notes": "Pre-authorization for AMI – Post-Stent"
  },
  {
    "id": "CLM-2026-104",
    "claimId": "CLM-2026-104",
    "patientId": "P10033",
    "patientName": "Sunita Iyer",
    "insuranceProvider": "Care Health Insurance",
    "policyNumber": "POL-889903",
    "claimAmount": 25500,
    "approvedAmount": 21000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99883",
    "notes": "Pre-authorization for Coronary Artery Disease"
  },
  {
    "id": "CLM-2026-105",
    "claimId": "CLM-2026-105",
    "patientId": "P10047",
    "patientName": "Prakash Nair",
    "insuranceProvider": "Bajaj Allianz Health",
    "policyNumber": "POL-889904",
    "claimAmount": 29000,
    "approvedAmount": 0,
    "status": "Claim Settled",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99884",
    "notes": "Pre-authorization for Chronic Migraine"
  },
  {
    "id": "CLM-2026-106",
    "claimId": "CLM-2026-106",
    "patientId": "P10055",
    "patientName": "Fatima Begum",
    "insuranceProvider": "Max Bupa (Niva Bupa)",
    "policyNumber": "POL-889905",
    "claimAmount": 32500,
    "approvedAmount": 0,
    "status": "Submitted",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99885",
    "notes": "Pre-authorization for Labour – Active"
  },
  {
    "id": "CLM-2026-107",
    "claimId": "CLM-2026-107",
    "patientId": "P10062",
    "patientName": "Rajesh Varma",
    "insuranceProvider": "New India Assurance",
    "policyNumber": "POL-889906",
    "claimAmount": 36000,
    "approvedAmount": 30000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99886",
    "notes": "Pre-authorization for Post Hip Replacement"
  },
  {
    "id": "CLM-2026-108",
    "claimId": "CLM-2026-108",
    "patientId": "P10069",
    "patientName": "Deepa Thomas",
    "insuranceProvider": "Star Health Insurance",
    "policyNumber": "POL-889907",
    "claimAmount": 39500,
    "approvedAmount": 0,
    "status": "Pre-Auth Pending",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99887",
    "notes": "Pre-authorization for Acute Appendicitis"
  },
  {
    "id": "CLM-2026-109",
    "claimId": "CLM-2026-109",
    "patientId": "P10011",
    "patientName": "Kavitha Rao",
    "insuranceProvider": "HDFC ERGO Health",
    "policyNumber": "POL-889908",
    "claimAmount": 43000,
    "approvedAmount": 0,
    "status": "Under Review",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99888",
    "notes": "Pre-authorization for Hypothyroidism"
  },
  {
    "id": "CLM-2026-110",
    "claimId": "CLM-2026-110",
    "patientId": "P10052",
    "patientName": "Mohammed Aslam",
    "insuranceProvider": "ICICI Lombard",
    "policyNumber": "POL-889909",
    "claimAmount": 46500,
    "approvedAmount": 39000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99889",
    "notes": "Pre-authorization for Bronchial Asthma"
  },
  {
    "id": "CLM-2026-111",
    "claimId": "CLM-2026-111",
    "patientId": "P10018",
    "patientName": "Karthik Suresh",
    "insuranceProvider": "Care Health Insurance",
    "policyNumber": "POL-889910",
    "claimAmount": 50000,
    "approvedAmount": 0,
    "status": "Claim Settled",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99890",
    "notes": "Pre-authorization for Seizure Disorder"
  },
  {
    "id": "CLM-2026-112",
    "claimId": "CLM-2026-112",
    "patientId": "P10031",
    "patientName": "Lalitha Iyer",
    "insuranceProvider": "Bajaj Allianz Health",
    "policyNumber": "POL-889911",
    "claimAmount": 53500,
    "approvedAmount": 0,
    "status": "Submitted",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99891",
    "notes": "Pre-authorization for Hypertensive Heart Disease"
  },
  {
    "id": "CLM-2026-113",
    "claimId": "CLM-2026-113",
    "patientId": "P10060",
    "patientName": "Sunita Pillai",
    "insuranceProvider": "Max Bupa (Niva Bupa)",
    "policyNumber": "POL-889912",
    "claimAmount": 57000,
    "approvedAmount": 48000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99892",
    "notes": "Pre-authorization for Cervical Spondylosis"
  },
  {
    "id": "CLM-2026-114",
    "claimId": "CLM-2026-114",
    "patientId": "P10071",
    "patientName": "Ravi Shankar",
    "insuranceProvider": "New India Assurance",
    "policyNumber": "POL-889913",
    "claimAmount": 60500,
    "approvedAmount": 0,
    "status": "Pre-Auth Pending",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99893",
    "notes": "Pre-authorization for Angina Pectoris"
  },
  {
    "id": "CLM-2026-115",
    "claimId": "CLM-2026-115",
    "patientId": "P10075",
    "patientName": "Anil Deshmukh",
    "insuranceProvider": "Star Health Insurance",
    "policyNumber": "POL-889914",
    "claimAmount": 64000,
    "approvedAmount": 0,
    "status": "Under Review",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99894",
    "notes": "Pre-authorization for Type 2 Diabetes Mellitus"
  },
  {
    "id": "CLM-2026-116",
    "claimId": "CLM-2026-116",
    "patientId": "P10080",
    "patientName": "Pooja Hegde",
    "insuranceProvider": "HDFC ERGO Health",
    "policyNumber": "POL-889915",
    "claimAmount": 67500,
    "approvedAmount": 57000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99895",
    "notes": "Pre-authorization for Psoriasis Vulgaris"
  },
  {
    "id": "CLM-2026-117",
    "claimId": "CLM-2026-117",
    "patientId": "P10085",
    "patientName": "Suresh Menon",
    "insuranceProvider": "ICICI Lombard",
    "policyNumber": "POL-889916",
    "claimAmount": 71000,
    "approvedAmount": 0,
    "status": "Claim Settled",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99896",
    "notes": "Pre-authorization for Osteoarthritis Knee"
  },
  {
    "id": "CLM-2026-118",
    "claimId": "CLM-2026-118",
    "patientId": "P10089",
    "patientName": "Lakshmi Pillai",
    "insuranceProvider": "Care Health Insurance",
    "policyNumber": "POL-889917",
    "claimAmount": 74500,
    "approvedAmount": 0,
    "status": "Submitted",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99897",
    "notes": "Pre-authorization for Acute Tonsillitis"
  },
  {
    "id": "CLM-2026-119",
    "claimId": "CLM-2026-119",
    "patientId": "P10092",
    "patientName": "Vikramaditya Roy",
    "insuranceProvider": "Bajaj Allianz Health",
    "policyNumber": "POL-889918",
    "claimAmount": 78000,
    "approvedAmount": 66000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99898",
    "notes": "Pre-authorization for BPH – Benign Prostatic Hyperplasia"
  },
  {
    "id": "CLM-2026-120",
    "claimId": "CLM-2026-120",
    "patientId": "P10098",
    "patientName": "Geetha Krishnan",
    "insuranceProvider": "Max Bupa (Niva Bupa)",
    "policyNumber": "POL-889919",
    "claimAmount": 81500,
    "approvedAmount": 0,
    "status": "Pre-Auth Pending",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99899",
    "notes": "Pre-authorization for COPD Exacerbation"
  },
  {
    "id": "CLM-2026-121",
    "claimId": "CLM-2026-121",
    "patientId": "P10102",
    "patientName": "Vikram Malhotra",
    "insuranceProvider": "New India Assurance",
    "policyNumber": "POL-889920",
    "claimAmount": 85000,
    "approvedAmount": 0,
    "status": "Under Review",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99900",
    "notes": "Pre-authorization for Right Femur Fracture"
  },
  {
    "id": "CLM-2026-122",
    "claimId": "CLM-2026-122",
    "patientId": "P10108",
    "patientName": "Sangeetha Reddi",
    "insuranceProvider": "Star Health Insurance",
    "policyNumber": "POL-889921",
    "claimAmount": 88500,
    "approvedAmount": 75000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99901",
    "notes": "Pre-authorization for Chronic Gastritis"
  },
  {
    "id": "CLM-2026-123",
    "claimId": "CLM-2026-123",
    "patientId": "P10115",
    "patientName": "Ananya Roy",
    "insuranceProvider": "HDFC ERGO Health",
    "policyNumber": "POL-889922",
    "claimAmount": 92000,
    "approvedAmount": 0,
    "status": "Claim Settled",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99902",
    "notes": "Pre-authorization for Type 1 Diabetes"
  },
  {
    "id": "CLM-2026-124",
    "claimId": "CLM-2026-124",
    "patientId": "P10120",
    "patientName": "Harish Chandra",
    "insuranceProvider": "ICICI Lombard",
    "policyNumber": "POL-889923",
    "claimAmount": 95500,
    "approvedAmount": 0,
    "status": "Submitted",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99903",
    "notes": "Pre-authorization for Chronic Kidney Disease"
  },
  {
    "id": "CLM-2026-125",
    "claimId": "CLM-2026-125",
    "patientId": "P10128",
    "patientName": "Suresh Gupta",
    "insuranceProvider": "Care Health Insurance",
    "policyNumber": "POL-889924",
    "claimAmount": 99000,
    "approvedAmount": 84000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99904",
    "notes": "Pre-authorization for Severe Bronchospasm"
  },
  {
    "id": "CLM-2026-126",
    "claimId": "CLM-2026-126",
    "patientId": "P10135",
    "patientName": "Divya Mukhopadhyay",
    "insuranceProvider": "Bajaj Allianz Health",
    "policyNumber": "POL-889925",
    "claimAmount": 102500,
    "approvedAmount": 0,
    "status": "Pre-Auth Pending",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99905",
    "notes": "Pre-authorization for Hyperthyroidism"
  },
  {
    "id": "CLM-2026-127",
    "claimId": "CLM-2026-127",
    "patientId": "P10140",
    "patientName": "Amitabh Saxena",
    "insuranceProvider": "Max Bupa (Niva Bupa)",
    "policyNumber": "POL-889926",
    "claimAmount": 106000,
    "approvedAmount": 0,
    "status": "Under Review",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99906",
    "notes": "Pre-authorization for Chemotherapy Protocol"
  },
  {
    "id": "CLM-2026-128",
    "claimId": "CLM-2026-128",
    "patientId": "P10145",
    "patientName": "Rohit Shetty",
    "insuranceProvider": "New India Assurance",
    "policyNumber": "POL-889927",
    "claimAmount": 109500,
    "approvedAmount": 93000,
    "status": "Approved",
    "submittedDate": "2026-09-18",
    "tpaApprovalCode": "TPA-99907",
    "notes": "Pre-authorization for Chronic Sinusitis"
  }
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
