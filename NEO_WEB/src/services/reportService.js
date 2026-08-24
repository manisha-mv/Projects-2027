// services/reportService.js
// Reports — parameterized queries — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const token = () => localStorage.getItem('neohms_token');
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const REPORT_TYPES = [
  { id: 'patients',      label: 'Patient Report',          icon: 'patients',  description: 'Patient registrations, demographics, and status' },
  { id: 'appointments',  label: 'Appointment Report',      icon: 'calendar',  description: 'Appointments by status, doctor, and department' },
  { id: 'doctors',       label: 'Doctor Report',           icon: 'doctor',    description: 'Doctor consultation loads and availability' },
  { id: 'departments',   label: 'Department Report',       icon: 'dept',      description: 'Department-wise patient volume and occupancy' },
  { id: 'laboratory',    label: 'Laboratory Report',       icon: 'lab',       description: 'Lab test orders, turnaround times, and results' },
  { id: 'radiology',     label: 'Radiology Report',        icon: 'radiology', description: 'Radiology orders, modalities, and report status' },
  { id: 'pharmacy',      label: 'Pharmacy Report',         icon: 'pharmacy',  description: 'Prescription dispensing and medicine utilization' },
  { id: 'billing',       label: 'Billing Report',          icon: 'billing',   description: 'Revenue, outstanding payments, and invoices' },
  { id: 'admissions',    label: 'Admission Report',        icon: 'ipd',       description: 'IPD admissions, ward occupancy, and length of stay' },
  { id: 'discharge',     label: 'Discharge Report',        icon: 'discharge', description: 'Discharge summaries and follow-up compliance' },
  { id: 'complaints',    label: 'Complaint Report',        icon: 'complaint', description: 'Complaint trends, resolution times, and categories' },
  { id: 'audit',         label: 'Audit Report',            icon: 'audit',     description: 'System activity, user actions, and security events' },
  { id: 'traceability',  label: 'Traceability Report',     icon: 'trace',     description: 'End-to-end patient care pathway analysis' },
];

// Generate local summary statistics from localStorage data
const buildLocalReport = (type) => {
  const get = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };

  switch (type) {
    case 'patients': {
      const list = get('neo_hms_patients_v1');
      const byStatus = {};
      const byGender = {};
      list.forEach(p => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
        byGender[p.gender] = (byGender[p.gender] || 0) + 1;
      });
      return { total: list.length, byStatus, byGender, data: list };
    }
    case 'appointments': {
      const list = get('neo_hms_appointments_v1');
      const byStatus = {};
      list.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
      return { total: list.length, byStatus, data: list };
    }
    case 'laboratory': {
      const list = get('neo_hms_lab_v1');
      const byStatus = {};
      const byUrgency = {};
      list.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; byUrgency[l.urgency] = (byUrgency[l.urgency] || 0) + 1; });
      return { total: list.length, byStatus, byUrgency, data: list };
    }
    case 'billing': {
      const list = get('neo_hms_invoices_v1');
      const totalRevenue = list.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
      const pendingAmount = list.filter(i => ['Issued', 'Partially Paid', 'Overdue'].includes(i.status)).reduce((s, i) => s + i.balance, 0);
      return { total: list.length, totalRevenue, pendingAmount, data: list };
    }
    case 'complaints': {
      const list = get('neo_hms_complaints_v1');
      const byStatus = {};
      const byCategory = {};
      list.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; byCategory[c.category] = (byCategory[c.category] || 0) + 1; });
      return { total: list.length, byStatus, byCategory, data: list };
    }
    case 'admissions': {
      const list = get('neo_hms_ipd_admissions_v1');
      const byWard = {};
      list.forEach(a => { byWard[a.ward] = (byWard[a.ward] || 0) + 1; });
      return { total: list.length, active: list.filter(a => a.status === 'Active').length, byWard, data: list };
    }
    default:
      return { total: 0, data: [], message: `${type} report will be available when backend is connected.` };
  }
};

export const reportService = {
  async getReport(type, params = {}) {
    const { from = '', to = '', department = '' } = params;
    try {
      const q = new URLSearchParams({ type, from, to, department }).toString();
      const res = await fetch(`${API_BASE_URL}/reports?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { report: d.data, type, isLiveApi: true }; }
    } catch { /* */ }
    return { report: buildLocalReport(type), type, isLiveApi: false };
  },
};

export default reportService;
