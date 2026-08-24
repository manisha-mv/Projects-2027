// services/notificationService.js
// Role-based notifications — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_notifications_v1';
const token = () => localStorage.getItem('neohms_token');

export const NOTIFICATION_TYPES = ['lab', 'appointment', 'pharmacy', 'complaint', 'emergency', 'radiology', 'medication', 'lowstock', 'followup', 'discharge', 'system'];

const SEED = [
  { id: 'NOTIF-001', type: 'lab', title: 'Lab Result Ready', message: 'CBC Panel result ready for P10025 – Arun Kumar.', forRoles: ['DOCTOR', 'ADMIN'], read: false, link: '/laboratory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-002', type: 'appointment', title: 'New Appointment Booked', message: 'APT-2026-000009 — Dr. Kiran Rao at 2:00 PM with Sunita Pillai.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: false, link: '/appointments', timestamp: new Date().toISOString() },
  { id: 'NOTIF-003', type: 'pharmacy', title: 'Prescription Pending', message: 'RX-2026-001 awaiting dispensing for Arun Kumar.', forRoles: ['PHARMACIST', 'ADMIN'], read: false, link: '/pharmacy', timestamp: new Date().toISOString() },
  { id: 'NOTIF-004', type: 'lowstock', title: 'Low Stock Alert', message: 'Metformin 500mg stock below minimum (42 units remaining).', forRoles: ['PHARMACIST', 'ADMIN'], read: false, link: '/pharmacy-inventory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-005', type: 'emergency', title: 'Emergency Admission', message: 'Critical patient registered — Bed E-07 assigned.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: false, link: '/emergency', timestamp: new Date().toISOString() },
  { id: 'NOTIF-006', type: 'complaint', title: 'New Complaint Submitted', message: 'CMP-2026-001 — Long wait time in OPD.', forRoles: ['COMPLAINT_OFFICER', 'ADMIN'], read: true, link: '/complaints', timestamp: new Date().toISOString() },
  { id: 'NOTIF-007', type: 'followup', title: 'Overdue Follow-up', message: 'Rajesh Nair — Cardiology follow-up overdue by 3 days.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: true, link: '/followup', timestamp: new Date().toISOString() },
  { id: 'NOTIF-008', type: 'medication', title: 'Medication Task Pending', message: 'Heparin 5000 IU due at 10:00 for P10033 — Sunita Iyer.', forRoles: ['NURSE', 'ADMIN'], read: false, link: '/nursing', timestamp: new Date().toISOString() },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const notificationService = {
  async getNotifications(role = '') {
    try { const res = await fetch(`${API_BASE_URL}/notifications${role ? `?role=${role}` : ''}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { notifications: d.data, unread: d.data.filter(n => !n.read).length, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal();
    if (role) list = list.filter(n => !n.forRoles || n.forRoles.includes(role));
    return { notifications: list, unread: list.filter(n => !n.read).length, isLiveApi: false };
  },

  async markRead(id) {
    try { const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT', headers: h() }); if (res.ok) return { success: true, isLiveApi: true }; } catch { /* */ }
    const list = getLocal(); const idx = list.findIndex(n => n.id === id); if (idx !== -1) { list[idx] = { ...list[idx], read: true }; saveLocal(list); }
    return { success: true, isLiveApi: false };
  },

  async markAllRead(role = '') {
    try { const res = await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT', headers: h(), body: JSON.stringify({ role }) }); if (res.ok) return { success: true, isLiveApi: true }; } catch { /* */ }
    const list = getLocal().map(n => (!role || !n.forRoles || n.forRoles.includes(role)) ? { ...n, read: true } : n);
    saveLocal(list);
    return { success: true, isLiveApi: false };
  },
};

export default notificationService;
