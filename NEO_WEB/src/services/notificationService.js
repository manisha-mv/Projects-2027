// services/notificationService.js
// Role-based notifications — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_notifications_v3';
const token = () => localStorage.getItem('neohms_token');

export const NOTIFICATION_TYPES = ['lab', 'appointment', 'pharmacy', 'complaint', 'emergency', 'radiology', 'medication', 'lowstock', 'followup', 'discharge', 'system'];

const SEED = [
  { id: 'NOTIF-001', type: 'lab', title: 'Lab Result Ready', message: 'CBC Panel & Troponin I result ready for P10025 – Arun Kumar.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: false, link: '/laboratory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-002', type: 'appointment', title: 'New Appointment Booked', message: 'APT-2026-009 — Dr. Kiran Rao at 2:00 PM with Sunita Pillai.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: false, link: '/appointments', timestamp: new Date().toISOString() },
  { id: 'NOTIF-003', type: 'pharmacy', title: 'Prescription Pending', message: 'RX-2026-101 awaiting dispensing for Arun Kumar in General Ward.', forRoles: ['PHARMACIST', 'ADMIN'], read: false, link: '/pharmacy', timestamp: new Date().toISOString() },
  { id: 'NOTIF-004', type: 'lowstock', title: 'Low Stock Alert', message: 'Metformin 500mg & Ceftriaxone 1g stock below safety threshold.', forRoles: ['PHARMACIST', 'ADMIN'], read: false, link: '/pharmacy-inventory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-005', type: 'emergency', title: 'Critical Emergency Admission', message: 'Triage P1 Critical patient registered — Bed E-07 assigned.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: false, link: '/emergency', timestamp: new Date().toISOString() },
  { id: 'NOTIF-006', type: 'complaint', title: 'New Complaint Submitted', message: 'CMP-2026-001 — Long OPD wait time reported at Front Desk.', forRoles: ['COMPLAINT_OFFICER', 'ADMIN'], read: true, link: '/complaints', timestamp: new Date().toISOString() },
  { id: 'NOTIF-007', type: 'followup', title: 'Overdue Follow-up', message: 'Rajesh Nair — Cardiology follow-up overdue by 3 days.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: true, link: '/followup', timestamp: new Date().toISOString() },
  { id: 'NOTIF-008', type: 'medication', title: 'Medication Task Due', message: 'Heparin 5000 IU due at 10:00 AM for P10033 — Sunita Iyer.', forRoles: ['NURSE', 'ADMIN'], read: false, link: '/nursing', timestamp: new Date().toISOString() },
  { id: 'NOTIF-009', type: 'radiology', title: 'STAT X-Ray Report Verified', message: 'Chest X-Ray verified for P10067 — Rajesh Nair (Pulmonary Edema).', forRoles: ['DOCTOR', 'RADIOLOGIST', 'ADMIN'], read: false, link: '/radiology', timestamp: new Date().toISOString() },
  { id: 'NOTIF-010', type: 'discharge', title: 'Discharge Summary Prepared', message: 'Discharge summary ready for signoff for P10041 — Meena Devi.', forRoles: ['DOCTOR', 'ADMIN'], read: false, link: '/discharge', timestamp: new Date().toISOString() },
  { id: 'NOTIF-011', type: 'system', title: 'System Maintenance Notice', message: 'Scheduled DB backup tonight at 02:00 AM IST. Zero downtime expected.', forRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST'], read: true, link: '/settings', timestamp: new Date().toISOString() },
  { id: 'NOTIF-012', type: 'lab', title: 'Critical Blood Culture Alert', message: 'Blood culture positive for Staphylococcus in P10140 – Amitabh Saxena.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: false, link: '/laboratory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-013', type: 'emergency', title: 'Emergency Trauma Call', message: 'Code Red Trauma alert — ETA 5 mins for multi-vehicle accident patient.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: false, link: '/emergency', timestamp: new Date().toISOString() },
  { id: 'NOTIF-014', type: 'appointment', title: 'VIP Patient Consultation', message: 'VIP consultation scheduled with Dr. Ananya Menon at 11:30 AM.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: false, link: '/appointments', timestamp: new Date().toISOString() },
  { id: 'NOTIF-015', type: 'pharmacy', title: 'Narcotics Log Verification', message: 'Daily Morphine & Fentanyl audit required for OT Pharmacy.', forRoles: ['PHARMACIST', 'ADMIN'], read: false, link: '/pharmacy-inventory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-016', type: 'medication', title: 'Insulin Dosing Reminder', message: 'Regular Insulin 10 units SC due post-lunch for P10115 — Ananya Roy.', forRoles: ['NURSE', 'ADMIN'], read: false, link: '/nursing', timestamp: new Date().toISOString() },
  { id: 'NOTIF-017', type: 'radiology', title: 'Urgent CT Scan Ordered', message: 'STAT Brain CT ordered for P10018 — Karthik Suresh (Seizure).', forRoles: ['RADIOLOGIST', 'ADMIN'], read: false, link: '/radiology', timestamp: new Date().toISOString() },
  { id: 'NOTIF-018', type: 'complaint', title: 'Escalated Grievance Alert', message: 'Grievance escalated to Management — CMP-2026-004.', forRoles: ['COMPLAINT_OFFICER', 'ADMIN'], read: false, link: '/complaints', timestamp: new Date().toISOString() },
  { id: 'NOTIF-019', type: 'lowstock', title: 'Blood Bank Stock Warning', message: 'O negative PRBC blood bags low (only 8 units in stock).', forRoles: ['DOCTOR', 'ADMIN'], read: false, link: '/blood-bank', timestamp: new Date().toISOString() },
  { id: 'NOTIF-020', type: 'discharge', title: 'Pending Billing Clearance', message: 'P10062 — Rajesh Varma awaiting final bill settlement for discharge.', forRoles: ['BILLING', 'ADMIN'], read: false, link: '/billing', timestamp: new Date().toISOString() },
  { id: 'NOTIF-021', type: 'lab', title: 'Abnormal HbA1c Alert', message: 'HbA1c result 11.2% for P10075 – Anil Deshmukh.', forRoles: ['DOCTOR', 'ADMIN'], read: true, link: '/laboratory', timestamp: new Date().toISOString() },
  { id: 'NOTIF-022', type: 'appointment', title: 'Teleconsultation Ready', message: 'Video call link generated for Dr. Suresh Bhat & patient Prakash Nair.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: true, link: '/appointments', timestamp: new Date().toISOString() },
  { id: 'NOTIF-023', type: 'pharmacy', title: 'Drug Interaction Warning', message: 'Potential interaction: Warfarin + Aspirin flagged for P10031.', forRoles: ['PHARMACIST', 'DOCTOR', 'ADMIN'], read: false, link: '/pharmacy', timestamp: new Date().toISOString() },
  { id: 'NOTIF-024', type: 'medication', title: 'Vitals Alert - High BP', message: 'BP recorded 210/110 mmHg for P10031 — Lalitha Iyer.', forRoles: ['NURSE', 'DOCTOR', 'ADMIN'], read: false, link: '/nursing', timestamp: new Date().toISOString() },
  { id: 'NOTIF-025', type: 'emergency', title: 'Code Blue Cleared', message: 'Code Blue resolved in Cardiac ICU — Patient stabilized.', forRoles: ['DOCTOR', 'NURSE', 'ADMIN'], read: true, link: '/emergency', timestamp: new Date().toISOString() },
  { id: 'NOTIF-026', type: 'radiology', title: 'MRI Knee Report Completed', message: 'MRI Left Knee report uploaded for P10085 — Suresh Menon.', forRoles: ['DOCTOR', 'ADMIN'], read: true, link: '/radiology', timestamp: new Date().toISOString() },
  { id: 'NOTIF-027', type: 'followup', title: 'Post-Op Follow-up Scheduled', message: 'Post-Op Day 7 visit booked for P10062 — Rajesh Varma.', forRoles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN'], read: true, link: '/followup', timestamp: new Date().toISOString() },
  { id: 'NOTIF-028', type: 'system', title: 'Audit Log Export Complete', message: 'Monthly HIPAA security audit report generated successfully.', forRoles: ['ADMIN'], read: true, link: '/audit', timestamp: new Date().toISOString() }
];

const getLocal = () => {
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length >= 25) return parsed;
    }
  } catch { /* */ }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); } catch { /* */ }
  return SEED;
};

const saveLocal = (data) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch { /* */ }
};

const h = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {})
});

export const notificationService = {
  async getNotifications(role = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications${role ? `?role=${role}` : ''}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { notifications: d.data, unread: d.data.filter(n => !n.read).length, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getLocal();
    if (role && role !== 'All') {
      const rUpper = String(role).toUpperCase();
      list = list.filter(n =>
        !n.forRoles ||
        n.forRoles.length === 0 ||
        rUpper === 'ADMIN' ||
        rUpper === 'SUPER_ADMIN' ||
        n.forRoles.some(r => String(r).toUpperCase() === rUpper)
      );
    }
    return { notifications: list, unread: list.filter(n => !n.read).length, isLiveApi: false };
  },

  async markRead(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT', headers: h() });
      if (res.ok) return { success: true, isLiveApi: true };
    } catch { /* */ }

    const list = getLocal();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], read: true };
      saveLocal(list);
    }
    return { success: true, isLiveApi: false };
  },

  async markAllRead(role = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT', headers: h(), body: JSON.stringify({ role }) });
      if (res.ok) return { success: true, isLiveApi: true };
    } catch { /* */ }

    const rUpper = String(role).toUpperCase();
    const list = getLocal().map(n =>
      (!role || !n.forRoles || rUpper === 'ADMIN' || rUpper === 'SUPER_ADMIN' || n.forRoles.some(r => String(r).toUpperCase() === rUpper))
        ? { ...n, read: true }
        : n
    );
    saveLocal(list);
    return { success: true, isLiveApi: false };
  },
};

export default notificationService;
