// services/bloodBankService.js
// Blood Bank — inventory, requests, issuance — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const INV_KEY = 'neo_hms_blood_inventory_v3';
const REQ_KEY = 'neo_hms_blood_requests_v3';
const token = () => localStorage.getItem('neohms_token');
const today = new Date().toISOString().split('T')[0];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const REQUEST_STATUSES = ['Pending', 'Approved', 'Issued', 'Rejected', 'Returned'];

const SEED_INVENTORY = [
  { id: "BB-2026-101", unitId: "BAG-202601", bloodGroup: "O+", component: "PRBC (Whole Blood)", units: 18, unitsAvailable: 18, available: 18, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-102", unitId: "BAG-202602", bloodGroup: "A+", component: "Platelets", units: 14, unitsAvailable: 14, available: 14, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-103", unitId: "BAG-202603", bloodGroup: "B+", component: "Fresh Frozen Plasma (FFP)", units: 22, unitsAvailable: 22, available: 22, reserved: 3, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-104", unitId: "BAG-202604", bloodGroup: "AB+", component: "Cryoprecipitate", units: 10, unitsAvailable: 10, available: 10, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-105", unitId: "BAG-202605", bloodGroup: "O-", component: "PRBC (Whole Blood)", units: 8, unitsAvailable: 8, available: 8, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-106", unitId: "BAG-202606", bloodGroup: "A-", component: "Platelets", units: 12, unitsAvailable: 12, available: 12, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-107", unitId: "BAG-202607", bloodGroup: "B-", component: "Fresh Frozen Plasma (FFP)", units: 15, unitsAvailable: 15, available: 15, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-108", unitId: "BAG-202608", bloodGroup: "AB-", component: "Cryoprecipitate", units: 6, unitsAvailable: 6, available: 6, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-109", unitId: "BAG-202609", bloodGroup: "O+", component: "Platelets", units: 20, unitsAvailable: 20, available: 20, reserved: 4, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-110", unitId: "BAG-202610", bloodGroup: "A+", component: "PRBC (Whole Blood)", units: 25, unitsAvailable: 25, available: 25, reserved: 3, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-111", unitId: "BAG-202611", bloodGroup: "B+", component: "PRBC (Whole Blood)", units: 19, unitsAvailable: 19, available: 19, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-112", unitId: "BAG-202612", bloodGroup: "AB+", component: "Fresh Frozen Plasma (FFP)", units: 11, unitsAvailable: 11, available: 11, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-113", unitId: "BAG-202613", bloodGroup: "O-", component: "Platelets", units: 7, unitsAvailable: 7, available: 7, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-114", unitId: "BAG-202614", bloodGroup: "A-", component: "Fresh Frozen Plasma (FFP)", units: 9, unitsAvailable: 9, available: 9, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-115", unitId: "BAG-202615", bloodGroup: "B-", component: "PRBC (Whole Blood)", units: 13, unitsAvailable: 13, available: 13, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-116", unitId: "BAG-202616", bloodGroup: "AB-", component: "PRBC (Whole Blood)", units: 5, unitsAvailable: 5, available: 5, reserved: 0, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-117", unitId: "BAG-202617", bloodGroup: "O+", component: "Fresh Frozen Plasma (FFP)", units: 30, unitsAvailable: 30, available: 30, reserved: 5, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-118", unitId: "BAG-202618", bloodGroup: "A+", component: "Fresh Frozen Plasma (FFP)", units: 28, unitsAvailable: 28, available: 28, reserved: 4, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-119", unitId: "BAG-202619", bloodGroup: "B+", component: "Platelets", units: 16, unitsAvailable: 16, available: 16, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-120", unitId: "BAG-202620", bloodGroup: "AB+", component: "Platelets", units: 12, unitsAvailable: 12, available: 12, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-121", unitId: "BAG-202621", bloodGroup: "O-", component: "Fresh Frozen Plasma (FFP)", units: 10, unitsAvailable: 10, available: 10, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-122", unitId: "BAG-202622", bloodGroup: "A-", component: "PRBC (Whole Blood)", units: 11, unitsAvailable: 11, available: 11, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-123", unitId: "BAG-202623", bloodGroup: "B-", component: "Platelets", units: 8, unitsAvailable: 8, available: 8, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-124", unitId: "BAG-202624", bloodGroup: "AB-", component: "Platelets", units: 4, unitsAvailable: 4, available: 4, reserved: 0, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-04" },
  { id: "BB-2026-125", unitId: "BAG-202625", bloodGroup: "O+", component: "Cryoprecipitate", units: 15, unitsAvailable: 15, available: 15, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" },
  { id: "BB-2026-126", unitId: "BAG-202626", bloodGroup: "A+", component: "Cryoprecipitate", units: 12, unitsAvailable: 12, available: 12, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-02" },
  { id: "BB-2026-127", unitId: "BAG-202627", bloodGroup: "B+", component: "Cryoprecipitate", units: 14, unitsAvailable: 14, available: 14, reserved: 2, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-03" },
  { id: "BB-2026-128", unitId: "BAG-202628", bloodGroup: "O-", component: "Cryoprecipitate", units: 6, unitsAvailable: 6, available: 6, reserved: 1, expiryDate: "2026-10-30", status: "Available", location: "Refrigerated Unit R-01" }
];

const SEED_REQUESTS = [
  { id: 'BR-001', requestId: 'BR-001', patientId: 'P10033', patientName: 'Sunita Iyer', bloodGroup: 'AB+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Kiran Rao', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'AMI — possible transfusion' },
  { id: 'BR-002', requestId: 'BR-002', patientId: 'P10062', patientName: 'Rajesh Varma', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Suresh Bhat', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Post hip replacement' },
  { id: 'BR-003', requestId: 'BR-003', patientId: 'P10025', patientName: 'Arun Kumar', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Priya Sharma', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Pre-op reserve for hernia repair' },
  { id: 'BR-004', requestId: 'BR-004', patientId: 'P10041', patientName: 'Meena Devi', bloodGroup: 'B+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Rekha Singh', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Maternity intra-op support' },
  { id: 'BR-005', requestId: 'BR-005', patientId: 'P10067', patientName: 'Rajesh Nair', bloodGroup: 'A+', component: 'PRBC (Whole Blood)', units: 3, urgency: 'STAT', requestedBy: 'Dr. Kiran Rao', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Emergency CABG preparation' },
  { id: 'BR-006', requestId: 'BR-006', patientId: 'P10055', patientName: 'Fatima Begum', bloodGroup: 'O-', component: 'PRBC (Whole Blood)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Rekha Singh', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Emergency LSCS bleeding' },
  { id: 'BR-007', requestId: 'BR-007', patientId: 'P10069', patientName: 'Deepa Thomas', bloodGroup: 'O+', component: 'Fresh Frozen Plasma (FFP)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Rahul Mehta', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Appendectomy pre-op' },
  { id: 'BR-008', requestId: 'BR-008', patientId: 'P10011', patientName: 'Kavitha Rao', bloodGroup: 'AB+', component: 'Platelets', units: 4, urgency: 'Routine', requestedBy: 'Dr. Priya Sharma', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Thrombocytopenia management' },
  { id: 'BR-009', requestId: 'BR-009', patientId: 'P10052', patientName: 'Mohammed Aslam', bloodGroup: 'B+', component: 'Fresh Frozen Plasma (FFP)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Rakesh Jhunjhun', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Variceal bleeding support' },
  { id: 'BR-010', requestId: 'BR-010', patientId: 'P10018', patientName: 'Karthik Suresh', bloodGroup: 'A+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Ananya Menon', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Emergency craniotomy' },
  { id: 'BR-011', requestId: 'BR-011', patientId: 'P10031', patientName: 'Lalitha Iyer', bloodGroup: 'B+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Kiran Rao', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Pacemaker insertion reserve' },
  { id: 'BR-012', requestId: 'BR-012', patientId: 'P10060', patientName: 'Sunita Pillai', bloodGroup: 'AB-', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Ananya Menon', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'ACDF surgery reserve' },
  { id: 'BR-013', requestId: 'BR-013', patientId: 'P10071', patientName: 'Ravi Shankar', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Routine', requestedBy: 'Dr. Kiran Rao', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Angina workup reserve' },
  { id: 'BR-014', requestId: 'BR-014', patientId: 'P10075', patientName: 'Anil Deshmukh', bloodGroup: 'A+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Sanjay Dutt', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'TURP surgery reserve' },
  { id: 'BR-015', requestId: 'BR-015', patientId: 'P10080', patientName: 'Pooja Hegde', bloodGroup: 'O-', component: 'Fresh Frozen Plasma (FFP)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Rahul Mehta', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Allergic anaphylaxis workup' },
  { id: 'BR-016', requestId: 'BR-016', patientId: 'P10085', patientName: 'Suresh Menon', bloodGroup: 'A+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Suresh Bhat', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Total knee arthroplasty' },
  { id: 'BR-017', requestId: 'BR-017', patientId: 'P10089', patientName: 'Lakshmi Pillai', bloodGroup: 'AB+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Vikram Nair', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Paediatric anemia reserve' },
  { id: 'BR-018', requestId: 'BR-018', patientId: 'P10092', patientName: 'Vikramaditya Roy', bloodGroup: 'B-', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Sanjay Dutt', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Open cystolithotomy reserve' },
  { id: 'BR-019', requestId: 'BR-019', patientId: 'P10098', patientName: 'Geetha Krishnan', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Alok Verma', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'COPD severe anemia' },
  { id: 'BR-020', requestId: 'BR-020', patientId: 'P10102', patientName: 'Vikram Malhotra', bloodGroup: 'A+', component: 'PRBC (Whole Blood)', units: 3, urgency: 'STAT', requestedBy: 'Dr. Suresh Bhat', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Open femur fracture surgery' },
  { id: 'BR-021', requestId: 'BR-021', patientId: 'P10108', patientName: 'Sangeetha Reddi', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Rakesh Jhunjhun', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Severe GI bleed' },
  { id: 'BR-022', requestId: 'BR-022', patientId: 'P10115', patientName: 'Ananya Roy', bloodGroup: 'B+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Priya Sharma', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'DKA correction support' },
  { id: 'BR-023', requestId: 'BR-023', patientId: 'P10120', patientName: 'Harish Chandra', bloodGroup: 'AB-', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Meera Nambiar', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'CKD severe anemia' },
  { id: 'BR-024', requestId: 'BR-024', patientId: 'P10128', patientName: 'Suresh Gupta', bloodGroup: 'O-', component: 'PRBC (Whole Blood)', units: 2, urgency: 'Urgent', requestedBy: 'Dr. Alok Verma', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'Pneumothorax surgery reserve' },
  { id: 'BR-025', requestId: 'BR-025', patientId: 'P10135', patientName: 'Divya Mukhopadhyay', bloodGroup: 'A-', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Shalini Das', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Parathyroidectomy reserve' },
  { id: 'BR-026', requestId: 'BR-026', patientId: 'P10140', patientName: 'Amitabh Saxena', bloodGroup: 'B+', component: 'Platelets', units: 6, urgency: 'Urgent', requestedBy: 'Dr. Siddharth Roy', requestedAt: today, status: 'Approved', issuedAt: null, issuedBy: null, notes: 'Chemo thrombocytopenia' },
  { id: 'BR-027', requestId: 'BR-027', patientId: 'P10145', patientName: 'Rohit Shetty', bloodGroup: 'O+', component: 'PRBC (Whole Blood)', units: 1, urgency: 'Routine', requestedBy: 'Dr. Arun Krishnan', requestedAt: today, status: 'Issued', issuedAt: today, issuedBy: 'Blood Bank', notes: 'FESS surgery reserve' },
  { id: 'BR-028', requestId: 'BR-028', patientId: 'P10150', patientName: 'Farida Khan', bloodGroup: 'A+', component: 'Fresh Frozen Plasma (FFP)', units: 2, urgency: 'STAT', requestedBy: 'Dr. Preeti Deshmukh', requestedAt: today, status: 'Pending', issuedAt: null, issuedBy: null, notes: 'Post-op ICU support' }
];

const getL = (key, seed) => {
  try {
    const d = localStorage.getItem(key);
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
    }
  } catch { /* */ }
  try { localStorage.setItem(key, JSON.stringify(seed)); } catch { /* */ }
  return seed;
};

const saveL = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* */ }
};

const h = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {})
});

export const bloodBankService = {
  async getInventory() {
    try {
      const res = await fetch(`${API_BASE_URL}/blood-bank/inventory`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { inventory: d.data, isLiveApi: true };
      }
    } catch { /* */ }
    return { inventory: getL(INV_KEY, SEED_INVENTORY), isLiveApi: false };
  },

  async updateUnits(bloodGroup, delta, notes = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/blood-bank/inventory/${bloodGroup}`, { method: 'PUT', headers: h(), body: JSON.stringify({ delta, notes }) });
      if (res.ok) return { success: true, isLiveApi: true };
    } catch { /* */ }

    const list = getL(INV_KEY, SEED_INVENTORY);
    const idx = list.findIndex(b => b.bloodGroup === bloodGroup);
    if (idx === -1) throw new Error('Blood group not found');

    const currentUnits = list[idx].units ?? list[idx].unitsAvailable ?? list[idx].available ?? 10;
    const newUnits = Math.max(0, currentUnits + delta);
    list[idx] = {
      ...list[idx],
      units: newUnits,
      unitsAvailable: newUnits,
      available: newUnits,
      lastUpdated: today
    };
    saveL(INV_KEY, list);
    return { success: true, isLiveApi: false };
  },

  async getRequests(params = {}) {
    const { status = '' } = params;
    try {
      const res = await fetch(`${API_BASE_URL}/blood-bank/requests${status ? `?status=${status}` : ''}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { requests: d.data, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getL(REQ_KEY, SEED_REQUESTS);
    if (status && status !== 'All') list = list.filter(r => r.status === status);
    return { requests: list, isLiveApi: false };
  },

  async requestBlood(data) {
    const list = getL(REQ_KEY, SEED_REQUESTS);
    const id = `BR-${String(list.length + 101).padStart(3, '0')}`;
    const record = { id, requestId: id, ...data, requestedAt: today, status: 'Pending' };
    try {
      const res = await fetch(`${API_BASE_URL}/blood-bank/requests`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          list.unshift(d.data);
          saveL(REQ_KEY, list);
          return { success: true, request: d.data, isLiveApi: true };
        }
      }
    } catch { /* */ }

    list.unshift(record);
    saveL(REQ_KEY, list);
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
