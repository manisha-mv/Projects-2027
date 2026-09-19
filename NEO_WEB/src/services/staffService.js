// services/staffService.js
// Staff directory — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_staff_v1';
const token = () => localStorage.getItem('neohms_token');

export const STAFF_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING', 'INSURANCE', 'COMPLAINT_OFFICER'];
export const STAFF_STATUSES = ['Active', 'On Leave', 'Suspended', 'Resigned'];

const SEED = [
  {
    "id": "STF-001",
    "staffId": "STF-001",
    "name": "Dr. Arun Kumar",
    "role": "Senior Physician",
    "department": "General Medicine",
    "email": "arun.kumar@neohms.in",
    "phone": "+91 98450 12345",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-002",
    "staffId": "STF-002",
    "name": "Staff Meena Devi",
    "role": "Cardiologist",
    "department": "Cardiology",
    "email": "meena.devi@neohms.in",
    "phone": "+91 97112 88341",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-003",
    "staffId": "STF-003",
    "name": "Dr. Rajesh Nair",
    "role": "Neurologist",
    "department": "Neurology",
    "email": "rajesh.nair@neohms.in",
    "phone": "+91 94471 44520",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-004",
    "staffId": "STF-004",
    "name": "Staff Sunita Iyer",
    "role": "Senior Nurse",
    "department": "Nursing",
    "email": "sunita.iyer@neohms.in",
    "phone": "+91 98860 11223",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-005",
    "staffId": "STF-005",
    "name": "Dr. Prakash Nair",
    "role": "Lab Technician",
    "department": "Laboratory",
    "email": "prakash.nair@neohms.in",
    "phone": "+91 98860 77123",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-006",
    "staffId": "STF-006",
    "name": "Staff Fatima Begum",
    "role": "Pharmacist",
    "department": "Pharmacy",
    "email": "fatima.begum@neohms.in",
    "phone": "+91 91672 99001",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-007",
    "staffId": "STF-007",
    "name": "Dr. Rajesh Varma",
    "role": "Radiographer",
    "department": "Radiology",
    "email": "rajesh.varma@neohms.in",
    "phone": "+91 98230 44512",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-008",
    "staffId": "STF-008",
    "name": "Staff Deepa Thomas",
    "role": "Receptionist",
    "department": "Reception",
    "email": "deepa.thomas@neohms.in",
    "phone": "+91 97400 11223",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-009",
    "staffId": "STF-009",
    "name": "Dr. Kavitha Rao",
    "role": "Admin Officer",
    "department": "Administration",
    "email": "kavitha.rao@neohms.in",
    "phone": "+91 99001 22884",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-010",
    "staffId": "STF-010",
    "name": "Staff Mohammed Aslam",
    "role": "Surgeon",
    "department": "Surgery",
    "email": "mohammed.aslam@neohms.in",
    "phone": "+91 91672 33410",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-011",
    "staffId": "STF-011",
    "name": "Dr. Karthik Suresh",
    "role": "Senior Physician",
    "department": "General Medicine",
    "email": "karthik.suresh@neohms.in",
    "phone": "+91 98190 77654",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-012",
    "staffId": "STF-012",
    "name": "Staff Lalitha Iyer",
    "role": "Cardiologist",
    "department": "Cardiology",
    "email": "lalitha.iyer@neohms.in",
    "phone": "+91 94480 33211",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-013",
    "staffId": "STF-013",
    "name": "Dr. Sunita Pillai",
    "role": "Neurologist",
    "department": "Neurology",
    "email": "sunita.pillai@neohms.in",
    "phone": "+91 97411 88223",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-014",
    "staffId": "STF-014",
    "name": "Staff Ravi Shankar",
    "role": "Senior Nurse",
    "department": "Nursing",
    "email": "ravi.shankar@neohms.in",
    "phone": "+91 98200 11998",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-015",
    "staffId": "STF-015",
    "name": "Dr. Anil Deshmukh",
    "role": "Lab Technician",
    "department": "Laboratory",
    "email": "anil.deshmukh@neohms.in",
    "phone": "+91 98210 55443",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-016",
    "staffId": "STF-016",
    "name": "Staff Pooja Hegde",
    "role": "Pharmacist",
    "department": "Pharmacy",
    "email": "pooja.hegde@neohms.in",
    "phone": "+91 97654 32109",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-017",
    "staffId": "STF-017",
    "name": "Dr. Suresh Menon",
    "role": "Radiographer",
    "department": "Radiology",
    "email": "suresh.menon@neohms.in",
    "phone": "+91 94470 12345",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-018",
    "staffId": "STF-018",
    "name": "Staff Lakshmi Pillai",
    "role": "Receptionist",
    "department": "Reception",
    "email": "lakshmi.pillai@neohms.in",
    "phone": "+91 98450 66778",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-019",
    "staffId": "STF-019",
    "name": "Dr. Vikramaditya Roy",
    "role": "Admin Officer",
    "department": "Administration",
    "email": "vikramaditya.roy@neohms.in",
    "phone": "+91 98300 44332",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-020",
    "staffId": "STF-020",
    "name": "Staff Geetha Krishnan",
    "role": "Surgeon",
    "department": "Surgery",
    "email": "geetha.krishnan@neohms.in",
    "phone": "+91 94460 77889",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-021",
    "staffId": "STF-021",
    "name": "Dr. Vikram Malhotra",
    "role": "Senior Physician",
    "department": "General Medicine",
    "email": "vikram.malhotra@neohms.in",
    "phone": "+91 98110 99887",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-022",
    "staffId": "STF-022",
    "name": "Staff Sangeetha Reddi",
    "role": "Cardiologist",
    "department": "Cardiology",
    "email": "sangeetha.reddi@neohms.in",
    "phone": "+91 98480 11223",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-023",
    "staffId": "STF-023",
    "name": "Dr. Ananya Roy",
    "role": "Neurologist",
    "department": "Neurology",
    "email": "ananya.roy@neohms.in",
    "phone": "+91 98310 22334",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-024",
    "staffId": "STF-024",
    "name": "Staff Harish Chandra",
    "role": "Senior Nurse",
    "department": "Nursing",
    "email": "harish.chandra@neohms.in",
    "phone": "+91 94150 33445",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-025",
    "staffId": "STF-025",
    "name": "Dr. Suresh Gupta",
    "role": "Lab Technician",
    "department": "Laboratory",
    "email": "suresh.gupta@neohms.in",
    "phone": "+91 98100 55667",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-026",
    "staffId": "STF-026",
    "name": "Staff Divya Mukhopadhyay",
    "role": "Pharmacist",
    "department": "Pharmacy",
    "email": "divya.mukhopadhyay@neohms.in",
    "phone": "+91 98301 66778",
    "shift": "Night (00:00-08:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-027",
    "staffId": "STF-027",
    "name": "Dr. Amitabh Saxena",
    "role": "Radiographer",
    "department": "Radiology",
    "email": "amitabh.saxena@neohms.in",
    "phone": "+91 98102 77889",
    "shift": "Evening (16:00-00:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  },
  {
    "id": "STF-028",
    "staffId": "STF-028",
    "name": "Staff Rohit Shetty",
    "role": "Receptionist",
    "department": "Reception",
    "email": "rohit.shetty@neohms.in",
    "phone": "+91 98201 88990",
    "shift": "Morning (08:00-16:00)",
    "status": "Active",
    "joiningDate": "2020-03-15"
  }
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const staffService = {
  async getStaff(params = {}) {
    const { search = '', role = '', department = '', status = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, role, department, status, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/staff?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { staff: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.staffId?.toLowerCase().includes(q)); }
    if (role && role !== 'All') list = list.filter(s => s.role === role);
    if (department && department !== 'All') list = list.filter(s => s.department === department);
    if (status && status !== 'All') list = list.filter(s => s.status === status);
    return { staff: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async createStaff(data) {
    const list = getLocal();
    const id = `STF-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, staffId: id, ...data, status: data.status || 'Active' };
    try { const res = await fetch(`${API_BASE_URL}/staff`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, staff: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, staff: record, isLiveApi: false };
  },

  async updateStaff(id, data) {
    const list = getLocal(); const idx = list.findIndex(s => s.id === id || s.staffId === id); if (idx === -1) throw new Error('Staff not found');
    try { const res = await fetch(`${API_BASE_URL}/staff/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, staff: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...data }; saveLocal(list);
    return { success: true, staff: list[idx], isLiveApi: false };
  },
};

export default staffService;
