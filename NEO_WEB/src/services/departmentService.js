// services/departmentService.js
// Department management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_departments_v1';
const token = () => localStorage.getItem('neohms_token');

const SEED = [
  { id: 'DEPT-001', name: 'General Medicine',       head: 'Dr. Priya Sharma',  staffCount: 12, beds: 60, occupied: 48, phone: '+91 80 2234 0001', status: 'Active' },
  { id: 'DEPT-002', name: 'Cardiology',              head: 'Dr. Kiran Rao',     staffCount: 8,  beds: 40, occupied: 31, phone: '+91 80 2234 0002', status: 'Active' },
  { id: 'DEPT-003', name: 'Neurology',               head: 'Dr. Ananya Menon',  staffCount: 7,  beds: 36, occupied: 22, phone: '+91 80 2234 0003', status: 'Active' },
  { id: 'DEPT-004', name: 'Maternity & Gynaecology', head: 'Dr. Rekha Singh',   staffCount: 10, beds: 20, occupied: 18, phone: '+91 80 2234 0004', status: 'Active' },
  { id: 'DEPT-005', name: 'Orthopaedics',            head: 'Dr. Suresh Bhat',   staffCount: 9,  beds: 40, occupied: 27, phone: '+91 80 2234 0005', status: 'Active' },
  { id: 'DEPT-006', name: 'Paediatrics',             head: 'Dr. Vikram Nair',   staffCount: 6,  beds: 24, occupied: 10, phone: '+91 80 2234 0006', status: 'Active' },
  { id: 'DEPT-007', name: 'Dermatology',             head: 'Dr. Leena Joseph',  staffCount: 4,  beds: 10, occupied: 2,  phone: '+91 80 2234 0007', status: 'Active' },
  { id: 'DEPT-008', name: 'ENT',                     head: 'Dr. Arun Krishnan', staffCount: 5,  beds: 16, occupied: 7,  phone: '+91 80 2234 0008', status: 'Active' },
  { id: 'DEPT-009', name: 'Ophthalmology',           head: 'Dr. Pooja Gupta',   staffCount: 4,  beds: 12, occupied: 3,  phone: '+91 80 2234 0009', status: 'Active' },
  { id: 'DEPT-010', name: 'Emergency & Trauma',      head: 'Dr. Rahul Mehta',   staffCount: 15, beds: 10, occupied: 6,  phone: '+91 80 2234 0010', status: 'Active' },
  { id: 'DEPT-011', name: 'Laboratory',              head: 'Mr. Ravi T',        staffCount: 8,  beds: 0,  occupied: 0,  phone: '+91 80 2234 0011', status: 'Active' },
  { id: 'DEPT-012', name: 'Radiology',               head: 'Dr. Vijay R',       staffCount: 6,  beds: 0,  occupied: 0,  phone: '+91 80 2234 0012', status: 'Active' },
  { id: 'DEPT-013', name: 'Pharmacy',                head: 'Pharmacy Team Lead',staffCount: 5,  beds: 0,  occupied: 0,  phone: '+91 80 2234 0013', status: 'Active' },
  { id: 'DEPT-014', name: 'Finance & Billing',       head: 'Billing Team',      staffCount: 4,  beds: 0,  occupied: 0,  phone: '+91 80 2234 0014', status: 'Active' },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const departmentService = {
  async getDepartments(params = {}) {
    const { search = '', status = '' } = params;
    try { const q = new URLSearchParams({ search, status }).toString(); const res = await fetch(`${API_BASE_URL}/departments?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { departments: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(d => d.name?.toLowerCase().includes(q) || d.head?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(d => d.status === status);
    return { departments: list, total: list.length, isLiveApi: false };
  },

  async createDepartment(data) {
    const list = getLocal();
    const id = `DEPT-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, ...data, status: data.status || 'Active', staffCount: 0, occupied: 0 };
    try { const res = await fetch(`${API_BASE_URL}/departments`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.push(d.data); saveLocal(list); return { success: true, department: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.push(record); saveLocal(list);
    return { success: true, department: record, isLiveApi: false };
  },

  async updateDepartment(id, data) {
    const list = getLocal(); const idx = list.findIndex(d => d.id === id); if (idx === -1) throw new Error('Department not found');
    try { const res = await fetch(`${API_BASE_URL}/departments/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, department: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...data }; saveLocal(list);
    return { success: true, department: list[idx], isLiveApi: false };
  },
};

export default departmentService;
