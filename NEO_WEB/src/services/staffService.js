// services/staffService.js
// Staff directory — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_staff_v1';
const token = () => localStorage.getItem('neohms_token');

export const STAFF_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING', 'INSURANCE', 'COMPLAINT_OFFICER'];
export const STAFF_STATUSES = ['Active', 'On Leave', 'Suspended', 'Resigned'];

const SEED = [
  { id: 'STF-001', staffId: 'STF-001', name: 'System Admin', email: 'admin@hospital.com', phone: '+91 99000 00001', department: 'Administration', role: 'ADMIN', designation: 'System Administrator', joiningDate: '2020-01-01', status: 'Active', shift: 'General' },
  { id: 'STF-002', staffId: 'STF-002', name: 'Dr. Priya Sharma', email: 'priya.sharma@neohms.in', phone: '+91 98100 11001', department: 'General Medicine', role: 'DOCTOR', designation: 'Senior Physician', joiningDate: '2014-06-01', status: 'Active', shift: 'Morning' },
  { id: 'STF-003', staffId: 'STF-003', name: 'Reception Desk', email: 'reception@hospital.com', phone: '+91 99000 00003', department: 'OPD Reception', role: 'RECEPTIONIST', designation: 'Senior Receptionist', joiningDate: '2021-03-15', status: 'Active', shift: 'Morning' },
  { id: 'STF-004', staffId: 'STF-004', name: 'Pharmacy Team Lead', email: 'pharmacy@hospital.com', phone: '+91 99000 00004', department: 'Pharmacy', role: 'PHARMACIST', designation: 'Chief Pharmacist', joiningDate: '2019-07-01', status: 'Active', shift: 'General' },
  { id: 'STF-005', staffId: 'STF-005', name: 'Lab Technician', email: 'lab@hospital.com', phone: '+91 99000 00005', department: 'Laboratory', role: 'LAB', designation: 'Senior Lab Technician', joiningDate: '2020-11-01', status: 'Active', shift: 'Morning' },
  { id: 'STF-006', staffId: 'STF-006', name: 'Nurse Station', email: 'nurse@hospital.com', phone: '+91 99000 00006', department: 'Nursing', role: 'NURSE', designation: 'Head Nurse', joiningDate: '2018-04-15', status: 'Active', shift: 'Morning' },
  { id: 'STF-007', staffId: 'STF-007', name: 'Billing Team', email: 'billing@hospital.com', phone: '+91 99000 00007', department: 'Finance & Billing', role: 'BILLING', designation: 'Billing Supervisor', joiningDate: '2022-01-10', status: 'Active', shift: 'General' },
  { id: 'STF-008', staffId: 'STF-008', name: 'Radiology Dept', email: 'radiology@hospital.com', phone: '+91 99000 00008', department: 'Radiology', role: 'RADIOLOGY', designation: 'Radiographer', joiningDate: '2021-08-20', status: 'Active', shift: 'Morning' },
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
