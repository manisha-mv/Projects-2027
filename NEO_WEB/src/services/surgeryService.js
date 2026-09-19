// services/surgeryService.js
// Surgery / OT management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_surgery_v2';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const SURGERY_STATUSES = ['Requested', 'Scheduled', 'Pre-Op Checklist', 'In Progress', 'Completed', 'Post-Op', 'Cancelled'];
export const OT_ROOMS = ['OT-1 (General)', 'OT-2 (Cardiac)', 'OT-3 (Ortho)', 'OT-4 (Gynaecology)', 'OT-5 (Emergency)'];

const SEED = [
  { id: 'SRG-2026-001', surgeryId: 'SRG-2026-001', patientId: 'P10062', patientName: 'Rajesh Varma', surgeonId: 'D005', surgeonName: 'Dr. Suresh Bhat', procedure: 'Total Hip Replacement', scheduledDate: today, scheduledTime: '06:00', estimatedDuration: 180, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Procedure completed without complications. Cemented stem implanted.', postOpNotes: 'Stable. Pain management in progress. Day 4 post-op.', completedAt: today, assistants: ['Nurse D'] },
  { id: 'SRG-2026-002', surgeryId: 'SRG-2026-002', patientId: 'P10069', patientName: 'Deepa Thomas', surgeonId: 'D001', surgeonName: 'Dr. Priya Sharma', procedure: 'Laparoscopic Appendectomy', scheduledDate: today, scheduledTime: '08:30', estimatedDuration: 60, otRoom: 'OT-5 (Emergency)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'In Progress', preOpCompleted: true, intraOpNotes: 'Inflamed appendix exteriorized and ligated cleanly.', postOpNotes: null, completedAt: null, assistants: ['Nurse A'] },
  { id: 'SRG-2026-003', surgeryId: 'SRG-2026-003', patientId: 'P10033', patientName: 'Sunita Iyer', surgeonId: 'D002', surgeonName: 'Dr. Kiran Rao', procedure: 'Coronary Angioplasty + Stenting', scheduledDate: today, scheduledTime: '09:00', estimatedDuration: 90, otRoom: 'OT-2 (Cardiac)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Single vessel disease. LAD stented successfully. LVEF improved post-procedure.', postOpNotes: 'Stable in ICU. Monitoring for 24h.', completedAt: today, assistants: ['Nurse B'] },
  { id: 'SRG-2026-004', surgeryId: 'SRG-2026-004', patientId: 'P10055', patientName: 'Fatima Begum', surgeonId: 'D004', surgeonName: 'Dr. Rekha Singh', procedure: 'Emergency Lower Segment Cesarean Section', scheduledDate: today, scheduledTime: '10:15', estimatedDuration: 75, otRoom: 'OT-4 (Gynaecology)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'In Progress', preOpCompleted: true, intraOpNotes: 'Healthy male infant delivered, APGAR 9/10.', postOpNotes: null, completedAt: null, assistants: ['Nurse C'] },
  { id: 'SRG-2026-005', surgeryId: 'SRG-2026-005', patientId: 'P10102', patientName: 'Vikram Malhotra', surgeonId: 'D005', surgeonName: 'Dr. Suresh Bhat', procedure: 'Open Reduction & Internal Fixation (Right Femur)', scheduledDate: today, scheduledTime: '11:30', estimatedDuration: 150, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Pre-Op Checklist', preOpCompleted: true, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse D'] },
  { id: 'SRG-2026-006', surgeryId: 'SRG-2026-006', patientId: 'P10025', patientName: 'Arun Kumar', surgeonId: 'D001', surgeonName: 'Dr. Priya Sharma', procedure: 'Inguinal Hernioplasty', scheduledDate: today, scheduledTime: '13:00', estimatedDuration: 90, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse E'] },
  { id: 'SRG-2026-007', surgeryId: 'SRG-2026-007', patientId: 'P10041', patientName: 'Meena Devi', surgeonId: 'D004', surgeonName: 'Dr. Rekha Singh', procedure: 'Laparoscopic Cholecystectomy', scheduledDate: today, scheduledTime: '14:30', estimatedDuration: 100, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse A'] },
  { id: 'SRG-2026-008', surgeryId: 'SRG-2026-008', patientId: 'P10067', patientName: 'Rajesh Nair', surgeonId: 'D002', surgeonName: 'Dr. Kiran Rao', procedure: 'CABG (Off-Pump Coronary Artery Bypass)', scheduledDate: today, scheduledTime: '16:00', estimatedDuration: 240, otRoom: 'OT-2 (Cardiac)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse B'] },
  { id: 'SRG-2026-009', surgeryId: 'SRG-2026-009', patientId: 'P10047', patientName: 'Prakash Nair', surgeonId: 'D003', surgeonName: 'Dr. Ananya Menon', procedure: 'Lumbar Microdiscectomy L4-L5', scheduledDate: today, scheduledTime: '17:30', estimatedDuration: 120, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse C'] },
  { id: 'SRG-2026-010', surgeryId: 'SRG-2026-010', patientId: 'P10011', patientName: 'Kavitha Rao', surgeonId: 'D001', surgeonName: 'Dr. Priya Sharma', procedure: 'Total Thyroidectomy', scheduledDate: today, scheduledTime: '19:00', estimatedDuration: 120, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse D'] },
  { id: 'SRG-2026-011', surgeryId: 'SRG-2026-011', patientId: 'P10052', patientName: 'Mohammed Aslam', surgeonId: 'D015', surgeonName: 'Dr. Rakesh Jhunjhun', procedure: 'Diagnostic Upper GI Endoscopy & Banding', scheduledDate: today, scheduledTime: '07:30', estimatedDuration: 45, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Esophageal varices banded successfully.', postOpNotes: 'Patient resting in recovery ward.', completedAt: today, assistants: ['Nurse E'] },
  { id: 'SRG-2026-012', surgeryId: 'SRG-2026-012', patientId: 'P10018', patientName: 'Karthik Suresh', surgeonId: 'D003', surgeonName: 'Dr. Ananya Menon', procedure: 'Craniotomy & Evacuation of Subdural Hematoma', scheduledDate: today, scheduledTime: '05:00', estimatedDuration: 210, otRoom: 'OT-5 (Emergency)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Post-Op', preOpCompleted: true, intraOpNotes: 'Hematoma evacuated completely. Hemostasis secured.', postOpNotes: 'Intubated in Neuro ICU.', completedAt: today, assistants: ['Nurse A'] },
  { id: 'SRG-2026-013', surgeryId: 'SRG-2026-013', patientId: 'P10031', patientName: 'Lalitha Iyer', surgeonId: 'D002', surgeonName: 'Dr. Kiran Rao', procedure: 'Permanent Pacemaker Insertion', scheduledDate: today, scheduledTime: '10:00', estimatedDuration: 75, otRoom: 'OT-2 (Cardiac)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Dual chamber pacemaker implanted. Sensing & pacing parameters optimal.', postOpNotes: 'Transferred to CCU.', completedAt: today, assistants: ['Nurse B'] },
  { id: 'SRG-2026-014', surgeryId: 'SRG-2026-014', patientId: 'P10060', patientName: 'Sunita Pillai', surgeonId: 'D003', surgeonName: 'Dr. Ananya Menon', procedure: 'Anterior Cervical Discectomy & Fusion (ACDF)', scheduledDate: today, scheduledTime: '12:00', estimatedDuration: 150, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse C'] },
  { id: 'SRG-2026-015', surgeryId: 'SRG-2026-015', patientId: 'P10071', patientName: 'Ravi Shankar', surgeonId: 'D002', surgeonName: 'Dr. Kiran Rao', procedure: 'Pericardial Window Creation', scheduledDate: today, scheduledTime: '14:00', estimatedDuration: 90, otRoom: 'OT-2 (Cardiac)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse D'] },
  { id: 'SRG-2026-016', surgeryId: 'SRG-2026-016', patientId: 'P10075', patientName: 'Anil Deshmukh', surgeonId: 'D011', surgeonName: 'Dr. Sanjay Dutt', procedure: 'Transurethral Resection of Prostate (TURP)', scheduledDate: today, scheduledTime: '15:30', estimatedDuration: 90, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse E'] },
  { id: 'SRG-2026-017', surgeryId: 'SRG-2026-017', patientId: 'P10080', patientName: 'Pooja Hegde', surgeonId: 'D007', surgeonName: 'Dr. Leena Joseph', procedure: 'Excision Biopsy of Skin Lesion', scheduledDate: today, scheduledTime: '08:00', estimatedDuration: 45, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Lesion excised with clear margins. Sent for histopathology.', postOpNotes: 'Dressing intact.', completedAt: today, assistants: ['Nurse A'] },
  { id: 'SRG-2026-018', surgeryId: 'SRG-2026-018', patientId: 'P10085', patientName: 'Suresh Menon', surgeonId: 'D005', surgeonName: 'Dr. Suresh Bhat', procedure: 'Total Knee Arthroplasty (Left Knee)', scheduledDate: today, scheduledTime: '09:30', estimatedDuration: 120, otRoom: 'OT-3 (Ortho)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Completed', preOpCompleted: true, intraOpNotes: 'Implants secured. Full alignment restored.', postOpNotes: 'CPM machine started in ward.', completedAt: today, assistants: ['Nurse B'] },
  { id: 'SRG-2026-019', surgeryId: 'SRG-2026-019', patientId: 'P10089', patientName: 'Lakshmi Pillai', surgeonId: 'D008', surgeonName: 'Dr. Arun Krishnan', procedure: 'Adenotonsillectomy', scheduledDate: today, scheduledTime: '11:00', estimatedDuration: 60, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Post-Op', preOpCompleted: true, intraOpNotes: 'Bilateral tonsils and adenoids removed. Hemostasis by electrocautery.', postOpNotes: 'Recovering nicely in paediatric PACU.', completedAt: today, assistants: ['Nurse C'] },
  { id: 'SRG-2026-020', surgeryId: 'SRG-2026-020', patientId: 'P10092', patientName: 'Vikramaditya Roy', surgeonId: 'D011', surgeonName: 'Dr. Sanjay Dutt', procedure: 'Open Cystolithotomy', scheduledDate: today, scheduledTime: '13:00', estimatedDuration: 90, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse D'] },
  { id: 'SRG-2026-021', surgeryId: 'SRG-2026-021', patientId: 'P10098', patientName: 'Geetha Krishnan', surgeonId: 'D013', surgeonName: 'Dr. Alok Verma', procedure: 'Flexible Bronchoscopy & BAL', scheduledDate: today, scheduledTime: '14:30', estimatedDuration: 45, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse E'] },
  { id: 'SRG-2026-022', surgeryId: 'SRG-2026-022', patientId: 'P10108', patientName: 'Sangeetha Reddi', surgeonId: 'D015', surgeonName: 'Dr. Rakesh Jhunjhun', procedure: 'Diagnostic Laparoscopy & Adhesiolysis', scheduledDate: today, scheduledTime: '16:00', estimatedDuration: 75, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse A'] },
  { id: 'SRG-2026-023', surgeryId: 'SRG-2026-023', patientId: 'P10115', patientName: 'Ananya Roy', surgeonId: 'D004', surgeonName: 'Dr. Rekha Singh', procedure: 'Diagnostic Hysteroscopy & Polypectomy', scheduledDate: today, scheduledTime: '17:30', estimatedDuration: 45, otRoom: 'OT-4 (Gynaecology)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse B'] },
  { id: 'SRG-2026-024', surgeryId: 'SRG-2026-024', patientId: 'P10120', patientName: 'Harish Chandra', surgeonId: 'D016', surgeonName: 'Dr. Meera Nambiar', procedure: 'AV Fistula Creation (Left Radiocephalic)', scheduledDate: today, scheduledTime: '18:30', estimatedDuration: 90, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse C'] },
  { id: 'SRG-2026-025', surgeryId: 'SRG-2026-025', patientId: 'P10128', patientName: 'Suresh Gupta', surgeonId: 'D013', surgeonName: 'Dr. Alok Verma', procedure: 'Pleurodesis for Recurrent Pneumothorax', scheduledDate: today, scheduledTime: '19:30', estimatedDuration: 60, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse D'] },
  { id: 'SRG-2026-026', surgeryId: 'SRG-2026-026', patientId: 'P10135', patientName: 'Divya Mukhopadhyay', surgeonId: 'D014', surgeonName: 'Dr. Shalini Das', procedure: 'Subtotal Parathyroidectomy', scheduledDate: today, scheduledTime: '20:30', estimatedDuration: 100, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse E'] },
  { id: 'SRG-2026-027', surgeryId: 'SRG-2026-027', patientId: 'P10140', patientName: 'Amitabh Saxena', surgeonId: 'D017', surgeonName: 'Dr. Siddharth Roy', procedure: 'Chemo Port Insertion (Right Subclavian)', scheduledDate: today, scheduledTime: '21:30', estimatedDuration: 45, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse A'] },
  { id: 'SRG-2026-028', surgeryId: 'SRG-2026-028', patientId: 'P10145', patientName: 'Rohit Shetty', surgeonId: 'D008', surgeonName: 'Dr. Arun Krishnan', procedure: 'Functional Endoscopic Sinus Surgery (FESS)', scheduledDate: today, scheduledTime: '22:30', estimatedDuration: 90, otRoom: 'OT-1 (General)', anaesthesiologist: 'Dr. Preeti Deshmukh', status: 'Scheduled', preOpCompleted: false, intraOpNotes: null, postOpNotes: null, completedAt: null, assistants: ['Nurse B'] }
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

export const surgeryService = {
  async getSurgeries(params = {}) {
    const { search = '', status = '', date = '', page = 1, limit = 50 } = params;
    try {
      const q = new URLSearchParams({ search, status, date, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/surgery?${q}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { surgeries: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getLocal();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.patientName?.toLowerCase().includes(q) || s.procedure?.toLowerCase().includes(q) || s.surgeryId?.toLowerCase().includes(q) || s.surgeonName?.toLowerCase().includes(q));
    }
    if (status && status !== 'All') list = list.filter(s => s.status === status);
    if (date && date !== 'All') list = list.filter(s => s.scheduledDate === date);
    return { surgeries: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async scheduleSurgery(data) {
    const list = getLocal();
    const id = `SRG-${new Date().getFullYear()}-${String(list.length + 101).padStart(3, '0')}`;
    const record = { id, surgeryId: id, ...data, status: 'Scheduled', preOpCompleted: false };
    try {
      const res = await fetch(`${API_BASE_URL}/surgery`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          list.unshift(d.data);
          saveLocal(list);
          return { success: true, surgery: d.data, isLiveApi: true };
        }
      }
    } catch { /* */ }

    list.unshift(record);
    saveLocal(list);
    return { success: true, surgery: record, isLiveApi: false };
  },

  async updateSurgery(id, updates) {
    const list = getLocal();
    const idx = list.findIndex(s => s.id === id || s.surgeryId === id);
    if (idx === -1) throw new Error('Surgery not found');
    try {
      const res = await fetch(`${API_BASE_URL}/surgery/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(updates) });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          list[idx] = d.data;
          saveLocal(list);
          return { success: true, surgery: d.data, isLiveApi: true };
        }
      }
    } catch { /* */ }

    list[idx] = { ...list[idx], ...updates };
    if (updates.status === 'Completed') list[idx].completedAt = new Date().toISOString();
    saveLocal(list);
    return { success: true, surgery: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status) {
    return this.updateSurgery(id, { status });
  }
};

export default surgeryService;
