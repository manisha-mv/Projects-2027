// services/auditService.js
// Audit / Activity Log — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_audit_v1';
const token = () => localStorage.getItem('neohms_token');

const now = () => new Date().toISOString();
export const AUDIT_ACTIONS   = ['Login', 'Logout', 'View', 'Create', 'Update', 'Delete', 'Approve', 'Reject', 'Print', 'Export'];
export const AUDIT_MODULES   = ['Auth', 'Patients', 'Appointments', 'Lab', 'Radiology', 'Pharmacy', 'Nursing', 'IPD', 'Emergency', 'Surgery', 'Billing', 'Insurance', 'BloodBank', 'Discharge', 'FollowUp', 'Complaints', 'Staff', 'Departments', 'Reports', 'Settings'];
export const AUDIT_STATUSES  = ['Success', 'Failed', 'Warning'];

const SEED = [
  { id: 'AUD-001', userId: 'u1', userName: 'System Admin', role: 'ADMIN', action: 'Login', module: 'Auth', patientId: null, patientName: null, description: 'User login successful', ipAddress: '192.168.1.10', status: 'Success', timestamp: now() },
  { id: 'AUD-002', userId: 'u2', userName: 'Dr. Priya Sharma', role: 'DOCTOR', action: 'View', module: 'Patients', patientId: 'P10025', patientName: 'Arun Kumar', description: 'Viewed patient profile P10025', ipAddress: '192.168.1.11', status: 'Success', timestamp: now() },
  { id: 'AUD-003', userId: 'u2', userName: 'Dr. Priya Sharma', role: 'DOCTOR', action: 'Create', module: 'Lab', patientId: 'P10025', patientName: 'Arun Kumar', description: 'Created lab order LAB-2026-001 (CBC)', ipAddress: '192.168.1.11', status: 'Success', timestamp: now() },
  { id: 'AUD-004', userId: 'u5', userName: 'Laboratory Dept', role: 'LAB', action: 'Update', module: 'Lab', patientId: 'P10025', patientName: 'Arun Kumar', description: 'Entered result for LAB-2026-001', ipAddress: '192.168.1.14', status: 'Success', timestamp: now() },
  { id: 'AUD-005', userId: 'u1', userName: 'System Admin', role: 'ADMIN', action: 'Delete', module: 'Staff', patientId: null, patientName: null, description: 'Attempted to delete staff STF-008', ipAddress: '192.168.1.10', status: 'Failed', timestamp: now() },
  { id: 'AUD-006', userId: 'u3', userName: 'Reception Desk', role: 'RECEPTIONIST', action: 'Create', module: 'Appointments', patientId: 'P10041', patientName: 'Meena Devi', description: 'Created appointment APT-2026-000009', ipAddress: '192.168.1.12', status: 'Success', timestamp: now() },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const auditService = {
  async getLogs(params = {}) {
    const { search = '', module = '', action = '', status = '', role = '', page = 1, limit = 50 } = params;
    try { const q = new URLSearchParams({ search, module, action, status, role, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/audit/logs?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { logs: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(l => l.userName?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.ipAddress?.includes(q)); }
    if (module && module !== 'All') list = list.filter(l => l.module === module);
    if (action && action !== 'All') list = list.filter(l => l.action === action);
    if (status && status !== 'All') list = list.filter(l => l.status === status);
    if (role && role !== 'All') list = list.filter(l => l.role === role);
    const total = list.length;
    return { logs: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  // Call this to log actions from the frontend (if backend is available)
  async logAction(data) {
    try { await fetch(`${API_BASE_URL}/audit/logs`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); } catch { /* ignore — audit logging should never break the main flow */ }
    const list = getLocal();
    const id = `AUD-${String(list.length + 1).padStart(3, '0')}`;
    list.unshift({ id, ...data, timestamp: now() });
    localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 200))); // Keep last 200 logs locally
  },
};

export default auditService;
