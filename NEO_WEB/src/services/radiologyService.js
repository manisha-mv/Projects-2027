// services/radiologyService.js
// Radiology module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_radiology_v3';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const RADIOLOGY_MODALITIES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Echocardiography', 'PET Scan', 'Mammography', 'Fluoroscopy', 'DEXA Scan'];
export const RADIOLOGY_STATUSES   = ['Ordered', 'Scheduled', 'In Progress', 'Scan Completed', 'Report Entered', 'Verified', 'Cancelled'];

const SEED = [
  // ── TODAY'S ORDERS ───────────────────────────────────────────────────────────
  {
    id: 'RAD-2026-001', orderId: 'RAD-2026-001',
    patientId: 'P10047', patientName: 'Prakash Nair',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'CT Scan', bodyPart: 'Brain',
    urgency: 'Urgent', status: 'Scan Completed',
    orderedDate: today, scheduledDate: today, scheduledTime: '09:45 AM',
    completedAt: today + 'T10:30:00',
    report: null, impression: null,
    technician: 'Mr. Ravi T', radiologist: null,
    notes: 'Chronic migraine — rule out intracranial bleed',
  },
  {
    id: 'RAD-2026-002', orderId: 'RAD-2026-002',
    patientId: 'P10033', patientName: 'Sunita Iyer',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'Echocardiography', bodyPart: 'Heart',
    urgency: 'STAT', status: 'Verified',
    orderedDate: today, scheduledDate: today, scheduledTime: '08:30 AM',
    completedAt: today + 'T09:00:00',
    report: 'LVEF 45% — mildly reduced. Anterior wall hypokinesia in LAD territory. Mild mitral regurgitation.',
    impression: 'Anterior wall hypokinesia consistent with AMI. LVEF 45%. Recommend cardiology follow-up.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Post AMI stent — follow-up echo',
  },
  {
    id: 'RAD-2026-003', orderId: 'RAD-2026-003',
    patientId: 'P10025', patientName: 'Arun Kumar',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'Routine', status: 'Verified',
    orderedDate: today, scheduledDate: today, scheduledTime: '10:00 AM',
    completedAt: today + 'T10:20:00',
    report: 'Cardiomegaly noted. Lung fields are clear. No consolidation or pleural effusion.',
    impression: 'Cardiomegaly. No active parenchymal lesion. Recommend echocardiography.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Hypertensive patient — routine CXR',
  },
  {
    id: 'RAD-2026-004', orderId: 'RAD-2026-004',
    patientId: 'P10069', patientName: 'Deepa Thomas',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Abdomen',
    urgency: 'STAT', status: 'Report Entered',
    orderedDate: today, scheduledDate: today, scheduledTime: '10:45 AM',
    completedAt: today + 'T11:30:00',
    report: 'Appendix visualized — diameter 11mm, non-compressible with periappendiceal fat stranding.',
    impression: 'Acute appendicitis. Immediate surgical consultation advised.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Acute abdomen — emergency appendicitis assessment',
  },
  {
    id: 'RAD-2026-005', orderId: 'RAD-2026-005',
    patientId: 'P10052', patientName: 'Mohammed Aslam',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'Routine', status: 'Scheduled',
    orderedDate: today, scheduledDate: today, scheduledTime: '02:00 PM',
    completedAt: null, report: null, impression: null,
    technician: 'Mr. Ravi T', radiologist: null,
    notes: 'Bronchial asthma — follow-up CXR',
  },
  {
    id: 'RAD-2026-006', orderId: 'RAD-2026-006',
    patientId: 'P10067', patientName: 'Rajesh Nair',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'CT Scan', bodyPart: 'Chest',
    urgency: 'Urgent', status: 'In Progress',
    orderedDate: today, scheduledDate: today, scheduledTime: '11:30 AM',
    completedAt: null, report: null, impression: null,
    technician: 'Mr. Ravi T', radiologist: null,
    notes: 'Suspected pulmonary embolism — CT pulmonary angiography',
  },
  {
    id: 'RAD-2026-007', orderId: 'RAD-2026-007',
    patientId: 'P10062', patientName: 'Rajesh Varma',
    doctorId: 'D005', doctorName: 'Dr. Suresh Bhat',
    modality: 'X-Ray', bodyPart: 'Right Hip',
    urgency: 'Routine', status: 'Verified',
    orderedDate: today, scheduledDate: today, scheduledTime: '09:00 AM',
    completedAt: today + 'T09:25:00',
    report: 'Post-operative hip arthroplasty in situ. Prosthesis well-positioned. No dislocation.',
    impression: 'Satisfactory post hip replacement. No complications.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Post hip replacement day 4 — routine check X-ray',
  },
  {
    id: 'RAD-2026-008', orderId: 'RAD-2026-008',
    patientId: 'P10041', patientName: 'Meena Devi',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Pelvis',
    urgency: 'Routine', status: 'Scan Completed',
    orderedDate: today, scheduledDate: today, scheduledTime: '01:30 PM',
    completedAt: today + 'T13:55:00',
    report: null, impression: null,
    technician: 'Mr. Kumar S', radiologist: null,
    notes: 'Post-operative pelvic assessment',
  },
  {
    id: 'RAD-2026-009', orderId: 'RAD-2026-009',
    patientId: 'P10128', patientName: 'Suresh Gupta',
    doctorId: 'D004', doctorName: 'Dr. Rekha Singh',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'Urgent', status: 'Verified',
    orderedDate: today, scheduledDate: today, scheduledTime: '08:00 AM',
    completedAt: today + 'T08:20:00',
    report: 'Bilateral hyperinflation with flattening of diaphragm. Increased bronchial markings. No pneumothorax.',
    impression: 'Features consistent with COPD exacerbation. No pneumonia.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'COPD/Asthma exacerbation',
  },
  {
    id: 'RAD-2026-010', orderId: 'RAD-2026-010',
    patientId: 'P10089', patientName: 'Lakshmi Pillai',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'Routine', status: 'Ordered',
    orderedDate: today, scheduledDate: null, scheduledTime: null,
    completedAt: null, report: null, impression: null,
    technician: null, radiologist: null,
    notes: 'Paediatric fever workup — CXR to rule out pneumonia',
  },
  {
    id: 'RAD-2026-011', orderId: 'RAD-2026-011',
    patientId: 'P10102', patientName: 'Vikram Malhotra',
    doctorId: 'D005', doctorName: 'Dr. Suresh Bhat',
    modality: 'X-Ray', bodyPart: 'Right Femur',
    urgency: 'Routine', status: 'Verified',
    orderedDate: today, scheduledDate: today, scheduledTime: '07:45 AM',
    completedAt: today + 'T08:05:00',
    report: 'Right femur fracture fixation in situ. IM nail well-placed. No hardware failure.',
    impression: 'Stable fixation. Appropriate fracture alignment.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Trauma femur post ORIF — follow-up X-ray',
  },
  {
    id: 'RAD-2026-012', orderId: 'RAD-2026-012',
    patientId: 'P10055', patientName: 'Fatima Begum',
    doctorId: 'D004', doctorName: 'Dr. Rekha Singh',
    modality: 'Ultrasound', bodyPart: 'Obstetric',
    urgency: 'Routine', status: 'Report Entered',
    orderedDate: today, scheduledDate: today, scheduledTime: '10:00 AM',
    completedAt: today + 'T10:25:00',
    report: 'Single live intrauterine fetus at 38+2 weeks gestation. Fetal biophysical profile score 8/8. Adequate amniotic fluid index.',
    impression: 'Normal term pregnancy. Reactive NST. No immediate intervention needed.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Labor monitoring — obstetric BPP scan',
  },
  {
    id: 'RAD-2026-013', orderId: 'RAD-2026-013',
    patientId: 'P10018', patientName: 'Karthik Suresh',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'MRI', bodyPart: 'Brain',
    urgency: 'Urgent', status: 'Scheduled',
    orderedDate: today, scheduledDate: today, scheduledTime: '03:00 PM',
    completedAt: null, report: null, impression: null,
    technician: null, radiologist: null,
    notes: 'Seizure disorder — MRI brain for epilepsy protocol',
  },
  {
    id: 'RAD-2026-014', orderId: 'RAD-2026-014',
    patientId: 'P10115', patientName: 'Ananya Roy',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Abdomen',
    urgency: 'Routine', status: 'Ordered',
    orderedDate: today, scheduledDate: null, scheduledTime: null,
    completedAt: null, report: null, impression: null,
    technician: null, radiologist: null,
    notes: 'Diabetic nephropathy screening — renal USG',
  },
  {
    id: 'RAD-2026-015', orderId: 'RAD-2026-015',
    patientId: 'P10031', patientName: 'Lalitha Iyer',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'Echocardiography', bodyPart: 'Heart',
    urgency: 'Routine', status: 'Ordered',
    orderedDate: today, scheduledDate: null, scheduledTime: null,
    completedAt: null, report: null, impression: null,
    technician: null, radiologist: null,
    notes: 'Cardiac screening — follow-up echo for LVH',
  },

  // ── YESTERDAY'S ORDERS ───────────────────────────────────────────────────────
  {
    id: 'RAD-2026-016', orderId: 'RAD-2026-016',
    patientId: 'P10025', patientName: 'Arun Kumar',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Kidney/Bladder',
    urgency: 'Routine', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '11:00 AM',
    completedAt: yest + 'T11:40:00',
    report: 'Both kidneys normal in size and echogenicity. No hydronephrosis. No renal calculi. Bladder unremarkable.',
    impression: 'Normal renal ultrasound.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Hypertension — renal artery doppler',
  },
  {
    id: 'RAD-2026-017', orderId: 'RAD-2026-017',
    patientId: 'P10047', patientName: 'Prakash Nair',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'MRI', bodyPart: 'Brain',
    urgency: 'Urgent', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '02:30 PM',
    completedAt: yest + 'T03:15:00',
    report: 'No acute intracranial bleed or infarct. Mild prominence of cerebral sulci. White matter changes noted (Fazekas grade 1).',
    impression: 'No acute intracranial pathology. Mild cerebral atrophy.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Migraine — acute episode, rule out bleed',
  },
  {
    id: 'RAD-2026-018', orderId: 'RAD-2026-018',
    patientId: 'P10067', patientName: 'Rajesh Nair',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'STAT', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '09:15 AM',
    completedAt: yest + 'T09:30:00',
    report: 'Enlarged cardiac silhouette. Bilateral pulmonary edema with perihilar haziness. No pneumothorax.',
    impression: 'Pulmonary edema — consistent with cardiac failure. Immediate cardiology intervention.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'STAT CXR — suspected acute pulmonary oedema',
  },
  {
    id: 'RAD-2026-019', orderId: 'RAD-2026-019',
    patientId: 'P10033', patientName: 'Sunita Iyer',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'STAT', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '07:30 AM',
    completedAt: yest + 'T07:45:00',
    report: 'Stent tip visualized in left anterior descending territory. No pneumothorax. No effusion.',
    impression: 'Post-stent CXR satisfactory. No acute complications.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Post-AMI stent procedure — CXR',
  },
  {
    id: 'RAD-2026-020', orderId: 'RAD-2026-020',
    patientId: 'P10071', patientName: 'Ravi Shankar',
    doctorId: 'D002', doctorName: 'Dr. Kiran Rao',
    modality: 'CT Scan', bodyPart: 'Abdomen & Pelvis',
    urgency: 'Routine', status: 'Report Entered',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '01:00 PM',
    completedAt: yest + 'T01:45:00',
    report: 'Liver shows multiple hypodense lesions — largest 2.3cm in segment 6. Spleen and pancreas normal. No free fluid.',
    impression: 'Multiple hepatic lesions — likely metastatic. Recommend MRI liver and oncology consultation.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Abdominal pain workup',
  },
  {
    id: 'RAD-2026-021', orderId: 'RAD-2026-021',
    patientId: 'P10060', patientName: 'Sunita Pillai',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'MRI', bodyPart: 'Lumbar Spine',
    urgency: 'Routine', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '11:30 AM',
    completedAt: yest + 'T12:30:00',
    report: 'L4-L5 disc prolapse with neural foraminal narrowing on right side. L5-S1 moderate disc degeneration.',
    impression: 'L4-L5 PLID with right L5 nerve root compression. Physiotherapy and analgesics advised. Surgery if no relief.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Chronic back pain — lumbar MRI',
  },
  {
    id: 'RAD-2026-022', orderId: 'RAD-2026-022',
    patientId: 'P10102', patientName: 'Vikram Malhotra',
    doctorId: 'D005', doctorName: 'Dr. Suresh Bhat',
    modality: 'CT Scan', bodyPart: 'Right Femur',
    urgency: 'Urgent', status: 'Verified',
    orderedDate: yest, scheduledDate: yest, scheduledTime: '10:00 AM',
    completedAt: yest + 'T10:40:00',
    report: 'Comminuted fracture of right femoral shaft with displacement. No neurovascular compromise on CT.',
    impression: 'Comminuted right femur fracture — ORIF planned.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Acute trauma — pre-op CT femur',
  },

  // ── TWO DAYS AGO ORDERS ──────────────────────────────────────────────────────
  {
    id: 'RAD-2026-023', orderId: 'RAD-2026-023',
    patientId: 'P10011', patientName: 'Kavitha Rao',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Thyroid',
    urgency: 'Routine', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '09:30 AM',
    completedAt: twoDaysAgo + 'T09:55:00',
    report: 'Right lobe thyroid nodule 1.4cm — well-defined, isoechoic, no calcification, no increased vascularity. Left lobe normal.',
    impression: 'Benign-appearing thyroid nodule. TIRADS 2. Annual follow-up USG recommended.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Hypothyroidism follow-up — thyroid USG',
  },
  {
    id: 'RAD-2026-024', orderId: 'RAD-2026-024',
    patientId: 'P10052', patientName: 'Mohammed Aslam',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'X-Ray', bodyPart: 'Chest',
    urgency: 'Routine', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '11:00 AM',
    completedAt: twoDaysAgo + 'T11:20:00',
    report: 'Lung fields clear. No consolidation. Air trapping noted. Hyperinflated lung volumes.',
    impression: 'Air trapping consistent with asthma. No acute pneumonia.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Asthma follow-up CXR',
  },
  {
    id: 'RAD-2026-025', orderId: 'RAD-2026-025',
    patientId: 'P10025', patientName: 'Arun Kumar',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Echocardiography', bodyPart: 'Heart',
    urgency: 'Routine', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '02:00 PM',
    completedAt: twoDaysAgo + 'T02:35:00',
    report: 'LVEF 58% — normal. Concentric LV hypertrophy consistent with hypertension. No regional wall motion abnormality. No pericardial effusion.',
    impression: 'Concentric LVH. Good systolic function. Hypertension-related changes.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Hypertension — echo for LVH assessment',
  },
  {
    id: 'RAD-2026-026', orderId: 'RAD-2026-026',
    patientId: 'P10047', patientName: 'Prakash Nair',
    doctorId: 'D003', doctorName: 'Dr. Ananya Menon',
    modality: 'CT Scan', bodyPart: 'Cervical Spine',
    urgency: 'Routine', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '03:30 PM',
    completedAt: twoDaysAgo + 'T04:10:00',
    report: 'C5-C6 disc osteophyte complex causing mild right neural foraminal narrowing. Cord appears normal.',
    impression: 'Cervical spondylosis at C5-C6 with right foraminal stenosis.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Neck pain and radiculopathy',
  },
  {
    id: 'RAD-2026-027', orderId: 'RAD-2026-027',
    patientId: 'P10069', patientName: 'Deepa Thomas',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'CT Scan', bodyPart: 'Abdomen & Pelvis',
    urgency: 'STAT', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '08:30 AM',
    completedAt: twoDaysAgo + 'T09:15:00',
    report: 'Distended appendix (13mm diameter) with periappendiceal fat stranding and free fluid in pelvis. Fecolith noted.',
    impression: 'Perforated appendicitis. Immediate surgical intervention required.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'Emergency STAT CT — suspected perforated appendicitis',
  },
  {
    id: 'RAD-2026-028', orderId: 'RAD-2026-028',
    patientId: 'P10062', patientName: 'Rajesh Varma',
    doctorId: 'D005', doctorName: 'Dr. Suresh Bhat',
    modality: 'X-Ray', bodyPart: 'Pelvis',
    urgency: 'Urgent', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '06:30 AM',
    completedAt: twoDaysAgo + 'T06:50:00',
    report: 'Right acetabular fracture with proximal femoral head involvement. Pre-operative planning required.',
    impression: 'Right acetabular fracture — total hip arthroplasty planned.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Pre-op pelvis X-ray for hip fracture',
  },
  {
    id: 'RAD-2026-029', orderId: 'RAD-2026-029',
    patientId: 'P10128', patientName: 'Suresh Gupta',
    doctorId: 'D004', doctorName: 'Dr. Rekha Singh',
    modality: 'CT Scan', bodyPart: 'Chest',
    urgency: 'Urgent', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '01:00 PM',
    completedAt: twoDaysAgo + 'T01:45:00',
    report: 'HRCT chest: Bilateral ground glass opacities in lower lobes. Air trapping present. Bronchial wall thickening. No pulmonary embolism.',
    impression: 'HRCT features consistent with severe acute asthma/COPD exacerbation. No PE.',
    technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R',
    notes: 'HRCT chest — COPD/asthma severity assessment',
  },
  {
    id: 'RAD-2026-030', orderId: 'RAD-2026-030',
    patientId: 'P10041', patientName: 'Meena Devi',
    doctorId: 'D001', doctorName: 'Dr. Priya Sharma',
    modality: 'Ultrasound', bodyPart: 'Lower Abdomen',
    urgency: 'Routine', status: 'Verified',
    orderedDate: twoDaysAgo, scheduledDate: twoDaysAgo, scheduledTime: '11:30 AM',
    completedAt: twoDaysAgo + 'T12:00:00',
    report: 'Uterus and ovaries appear normal post-operatively. No free fluid collection. Surgical clips noted.',
    impression: 'Satisfactory post-operative appearance. No pelvic collection.',
    technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R',
    notes: 'Post-op follow-up pelvic USG',
  },
];

const getLocal = () => {
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length >= SEED.length) return parsed;
    }
  } catch { /* */ }
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
  return SEED;
};
const saveLocal = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const radiologyService = {
  async getOrders(params = {}) {
    const { search = '', status = '', modality = '', page = 1, limit = 50 } = params;
    try {
      const q = new URLSearchParams({ search, status, modality, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/radiology/orders?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data && d.data.length > 0) return { orders: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(o => o.patientName?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q) || o.modality?.toLowerCase().includes(q) || o.bodyPart?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(o => o.status === status);
    if (modality && modality !== 'All') list = list.filter(o => o.modality === modality);
    const total = list.length;
    return { orders: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async scheduleOrder(id, data) {
    const list = getLocal(); const idx = list.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders/${id}/schedule`, { method: 'PUT', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...data, status: 'Scheduled' }; saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status, extra = {}) {
    const list = getLocal(); const idx = list.findIndex(o => o.id === id); if (idx === -1) throw new Error('Order not found');
    const updates = { status, ...extra };
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders/${id}`, { method: 'PUT', headers: h(), body: JSON.stringify(updates) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], ...updates }; saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async enterReport(id, report, impression) {
    return this.updateStatus(id, 'Report Entered', { report, impression, reportedAt: new Date().toISOString() });
  },

  async verifyReport(id, radiologist) {
    return this.updateStatus(id, 'Verified', { radiologist, verifiedAt: new Date().toISOString() });
  },

  async createOrder(data) {
    const list = getLocal();
    const id = `RAD-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, orderId: id, ...data, status: 'Ordered', orderedDate: new Date().toISOString().split('T')[0], report: null, impression: null };
    try { const res = await fetch(`${API_BASE_URL}/radiology/orders`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, order: record, isLiveApi: false };
  },

  async getPatientHistory(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/radiology/patient/${patientId}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success) return { orders: d.data, isLiveApi: true }; } } catch { /* */ }
    return { orders: getLocal().filter(o => o.patientId === patientId), isLiveApi: false };
  },
};

export default radiologyService;
