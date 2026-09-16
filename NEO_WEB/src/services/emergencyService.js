// services/emergencyService.js
// Emergency Department — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_emergency_v2';
const token = () => localStorage.getItem('neohms_token');

const now = () => new Date().toISOString();
const todayT = (time) => new Date().toISOString().split('T')[0] + 'T' + time + ':00';
const yestT  = (time) => new Date(Date.now() - 86400000).toISOString().split('T')[0] + 'T' + time + ':00';
const twoDT  = (time) => new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] + 'T' + time + ':00';

export const TRIAGE_LEVELS     = ['P1 - Critical', 'P2 - Urgent', 'P3 - Semi-Urgent', 'P4 - Non-Urgent'];
export const EMERGENCY_STATUSES = ['Registered', 'Triaged', 'Under Treatment', 'Admitted', 'Discharged', 'Referred', 'Expired'];

const SEED = [
  // ── TODAY'S ACTIVE / RECENT CASES ─────────────────────────────────────────
  {
    id: 'EM-2026-001', emergencyId: 'EM-2026-001',
    patientId: 'P10069', patientName: 'Deepa Thomas', age: 31, gender: 'Female',
    phone: '+91 97400 11223', arrivalTime: todayT('08:28'),
    chiefComplaint: 'Severe acute abdominal pain (RLQ), nausea, vomiting since 6 hrs',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-07',
    treatment: 'IV Fluids 1L NS started, IV Ondansetron 4mg, USG Abdomen ordered, Surgery consult called',
    admittedAt: todayT('09:10'),
    notes: 'Emergency admission — Acute Perforated Appendicitis confirmed on USG. Surgery booked.',
  },
  {
    id: 'EM-2026-002', emergencyId: 'EM-2026-002',
    patientId: null, patientName: 'Unidentified Male (RTA)', age: 38, gender: 'Male',
    phone: null, arrivalTime: todayT('09:15'),
    chiefComplaint: 'RTA — Head trauma, unconscious, brought by ambulance, GCS 8/15',
    triage: 'P1 - Critical', status: 'Under Treatment',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-08',
    treatment: 'C-spine immobilization, STAT CT Brain ordered, IV access x2, O2 10L/min via mask',
    admittedAt: null,
    notes: 'No ID found. Brought by passerby. Police informed.',
  },
  {
    id: 'EM-2026-003', emergencyId: 'EM-2026-003',
    patientId: 'P10025', patientName: 'Arun Kumar', age: 42, gender: 'Male',
    phone: '+91 98450 12345', arrivalTime: todayT('07:45'),
    chiefComplaint: 'Severe hypertensive urgency — BP 210/115, throbbing headache, blurred vision',
    triage: 'P2 - Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-03',
    treatment: 'IV Labetalol 20mg bolus, BP monitoring every 15 min, ECG done — no ST changes',
    admittedAt: null, dischargedAt: todayT('10:30'),
    notes: 'BP controlled to 150/90 in 2 hours. Discharged with medications adjustment. Follow-up in 48h.',
  },
  {
    id: 'EM-2026-004', emergencyId: 'EM-2026-004',
    patientId: null, patientName: 'Rekha Sharma', age: 65, gender: 'Female',
    phone: '+91 99011 44532', arrivalTime: todayT('10:05'),
    chiefComplaint: 'Sudden onset right-sided weakness, slurred speech, facial droop — FAST positive',
    triage: 'P1 - Critical', status: 'Under Treatment',
    assignedDoctor: 'Dr. Ananya Menon', bedId: 'E-02',
    treatment: 'FAST exam done, Stroke team activated, CT Brain ordered, IV access, NIH stroke scale 14',
    admittedAt: null,
    notes: 'Suspected acute ischemic stroke. Thrombolysis eligibility being assessed.',
  },
  {
    id: 'EM-2026-005', emergencyId: 'EM-2026-005',
    patientId: 'P10052', patientName: 'Mohammed Aslam', age: 36, gender: 'Male',
    phone: '+91 91672 33410', arrivalTime: todayT('08:50'),
    chiefComplaint: 'Acute asthma attack — severe wheeze, SpO2 84%, unable to complete sentences',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Rekha Singh', bedId: 'E-04',
    treatment: 'Salbutamol nebulization x3, IV Hydrocortisone 200mg, O2 via venture mask 40%, SpO2 improving to 94%',
    admittedAt: todayT('09:00'),
    notes: 'Admitted to Pulmonology. Responded well to bronchodilators.',
  },
  {
    id: 'EM-2026-006', emergencyId: 'EM-2026-006',
    patientId: null, patientName: 'Sanjay Pillai', age: 55, gender: 'Male',
    phone: '+91 94412 78900', arrivalTime: todayT('11:20'),
    chiefComplaint: 'Central crushing chest pain radiating to left arm, diaphoresis — onset 45 min',
    triage: 'P1 - Critical', status: 'Under Treatment',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-01',
    treatment: 'ECG — ST elevation leads V1-V4 (STEMI). Aspirin 325mg, Clopidogrel 600mg given. Cath lab activated.',
    admittedAt: null,
    notes: 'STEMI protocol activated. Door-to-balloon target <90 min.',
  },
  {
    id: 'EM-2026-007', emergencyId: 'EM-2026-007',
    patientId: 'P10089', patientName: 'Lakshmi Pillai', age: 8, gender: 'Female',
    phone: '+91 96003 11230', arrivalTime: todayT('09:30'),
    chiefComplaint: 'High fever 104°F, febrile convulsion — 1 episode lasting 3 min, now post-ictal',
    triage: 'P2 - Urgent', status: 'Triaged',
    assignedDoctor: 'Dr. Ananya Menon', bedId: 'E-05',
    treatment: 'IV Diazepam 5mg given (seizure aborted), IV Paracetamol 250mg, blood culture sent',
    admittedAt: null,
    notes: 'Paediatric emergency. Child alert now. Paediatrics referral made.',
  },
  {
    id: 'EM-2026-008', emergencyId: 'EM-2026-008',
    patientId: null, patientName: 'Geeta Nair', age: 28, gender: 'Female',
    phone: '+91 93342 67891', arrivalTime: todayT('12:00'),
    chiefComplaint: 'Anaphylaxis — generalized urticaria, throat tightness, BP 70/40 after insect sting',
    triage: 'P1 - Critical', status: 'Registered',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-06',
    treatment: 'IM Adrenaline 0.5mg given, IV Hydrocortisone, IV antihistamine, fluids running',
    admittedAt: null,
    notes: 'Bee sting anaphylaxis. Responding to Adrenaline. Monitoring.',
  },
  {
    id: 'EM-2026-009', emergencyId: 'EM-2026-009',
    patientId: 'P10128', patientName: 'Suresh Gupta', age: 54, gender: 'Male',
    phone: '+91 98012 44200', arrivalTime: todayT('07:15'),
    chiefComplaint: 'Severe breathlessness at rest, unable to speak, SpO2 78%, COPD history',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Rekha Singh', bedId: 'E-09',
    treatment: 'NIV BiPAP started, IV Methylprednisolone 125mg, Salbutamol nebulization Q20min',
    admittedAt: todayT('07:30'),
    notes: 'Severe COPD exacerbation. Admitted to Pulmonology ICU.',
  },
  {
    id: 'EM-2026-010', emergencyId: 'EM-2026-010',
    patientId: null, patientName: 'Arjun Menon', age: 19, gender: 'Male',
    phone: '+91 99441 32000', arrivalTime: todayT('13:45'),
    chiefComplaint: 'Alleged poisoning — ingested unknown quantity of sleeping tablets, drowsy',
    triage: 'P2 - Urgent', status: 'Triaged',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-10',
    treatment: 'Gastric lavage done, Activated charcoal 50g given, IV access, continuous monitoring',
    admittedAt: null,
    notes: 'Intentional ingestion. Psychiatry consult requested. Parents informed.',
  },

  // ── YESTERDAY'S CASES ─────────────────────────────────────────────────────
  {
    id: 'EM-2026-011', emergencyId: 'EM-2026-011',
    patientId: 'P10033', patientName: 'Sunita Iyer', age: 50, gender: 'Female',
    phone: '+91 98200 55123', arrivalTime: yestT('06:40'),
    chiefComplaint: 'Acute chest pain, sweating, jaw pain — onset 30 min',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-01',
    treatment: 'ECG: NSTEMI — ST depression V4-V6. Aspirin 325mg, Heparin started. Troponin elevated.',
    admittedAt: yestT('07:15'),
    notes: 'NSTEMI confirmed. Admitted to Cardiology ICU bed CAR-02.',
  },
  {
    id: 'EM-2026-012', emergencyId: 'EM-2026-012',
    patientId: null, patientName: 'Kavitha Menon', age: 34, gender: 'Female',
    phone: '+91 98771 20033', arrivalTime: yestT('10:30'),
    chiefComplaint: 'RTA — fall from two-wheeler, right leg pain, unable to walk, deformity',
    triage: 'P2 - Urgent', status: 'Admitted',
    assignedDoctor: 'Dr. Suresh Bhat', bedId: 'E-05',
    treatment: 'X-ray femur: comminuted fracture. IV Tramadol, Thomas splint applied, blood sent pre-op',
    admittedAt: yestT('11:00'),
    notes: 'Admitted to Orthopaedics for ORIF. Surgery scheduled.',
  },
  {
    id: 'EM-2026-013', emergencyId: 'EM-2026-013',
    patientId: 'P10047', patientName: 'Prakash Nair', age: 54, gender: 'Male',
    phone: '+91 98860 77123', arrivalTime: yestT('08:05'),
    chiefComplaint: 'Severe migraine — throbbing unilateral headache 9/10, photophobia, vomiting',
    triage: 'P2 - Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Ananya Menon', bedId: 'E-06',
    treatment: 'IV Sumatriptan 6mg SC, IV Metoclopramide, darkroom rest, CT Brain: no bleed',
    admittedAt: null, dischargedAt: yestT('11:30'),
    notes: 'Headache resolved. Discharged with Sumatriptan nasal spray prescription.',
  },
  {
    id: 'EM-2026-014', emergencyId: 'EM-2026-014',
    patientId: null, patientName: 'Pooja Desai', age: 22, gender: 'Female',
    phone: '+91 92200 19910', arrivalTime: yestT('14:20'),
    chiefComplaint: 'Severe diabetic ketoacidosis — vomiting, Kussmaul breathing, glucose 480mg/dL',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-03',
    treatment: 'IV Normal Saline 1L bolus, Insulin drip 0.1U/kg/hr, potassium monitoring',
    admittedAt: yestT('14:40'),
    notes: 'Type 1 DM, new diagnosis. Admitted to General Medicine ward.',
  },
  {
    id: 'EM-2026-015', emergencyId: 'EM-2026-015',
    patientId: 'P10041', patientName: 'Meena Devi', age: 35, gender: 'Female',
    phone: '+91 97112 88341', arrivalTime: yestT('16:00'),
    chiefComplaint: 'Post-operative fever 103°F, wound redness, discharge from abdominal incision',
    triage: 'P2 - Urgent', status: 'Admitted',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-04',
    treatment: 'Wound swab sent for culture, IV Piperacillin-Tazobactam 4.5g started, Paracetamol IV',
    admittedAt: yestT('16:30'),
    notes: 'SSI (Surgical Site Infection) suspected. Admitted to surgical ward.',
  },
  {
    id: 'EM-2026-016', emergencyId: 'EM-2026-016',
    patientId: null, patientName: 'Ramesh Varma', age: 70, gender: 'Male',
    phone: '+91 98110 77312', arrivalTime: yestT('20:10'),
    chiefComplaint: 'Fall at home — head strike on floor, confusion, scalp laceration 5cm',
    triage: 'P2 - Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-07',
    treatment: 'Wound sutured with 5 sutures, CT Brain: No intracranial bleed, anti-tetanus given',
    admittedAt: null, dischargedAt: yestT('23:00'),
    notes: 'CT clear. Discharged with wound care instructions. Follow-up in 7 days for suture removal.',
  },
  {
    id: 'EM-2026-017', emergencyId: 'EM-2026-017',
    patientId: null, patientName: 'Priya Krishnan', age: 29, gender: 'Female',
    phone: '+91 90001 23344', arrivalTime: yestT('22:30'),
    chiefComplaint: 'Sudden onset palpitations, HR 180bpm, dizziness, pre-syncope',
    triage: 'P1 - Critical', status: 'Discharged',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-02',
    treatment: 'ECG: SVT. Vagal manoeuvre attempted — Valsalva successful. Reverted to sinus rhythm.',
    admittedAt: null, dischargedAt: yestT('23:45'),
    notes: 'SVT resolved spontaneously with Valsalva. Discharged. EP clinic referral given.',
  },

  // ── TWO DAYS AGO CASES ────────────────────────────────────────────────────
  {
    id: 'EM-2026-018', emergencyId: 'EM-2026-018',
    patientId: 'P10067', patientName: 'Rajesh Nair', age: 58, gender: 'Male',
    phone: '+91 94471 44520', arrivalTime: twoDT('06:00'),
    chiefComplaint: 'Acute dyspnea, orthopnea, bilateral leg swelling, SpO2 89%',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-01',
    treatment: 'IV Furosemide 80mg, Oxygen BiPAP, CXR: bilateral pulmonary edema',
    admittedAt: twoDT('06:20'),
    notes: 'Acute decompensated heart failure. Admitted to Cardiology ICU.',
  },
  {
    id: 'EM-2026-019', emergencyId: 'EM-2026-019',
    patientId: null, patientName: 'Fatima Hussain', age: 40, gender: 'Female',
    phone: '+91 99332 10001', arrivalTime: twoDT('09:30'),
    chiefComplaint: 'Sudden severe lower back pain after lifting — unable to stand, shooting to right leg',
    triage: 'P3 - Semi-Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Suresh Bhat', bedId: 'E-06',
    treatment: 'IV Diclofenac 75mg, Muscle relaxants, X-ray lumbar: no fracture. MRI ordered OPD',
    admittedAt: null, dischargedAt: twoDT('12:00'),
    notes: 'Acute disc prolapse L4-L5 suspected. Discharged with analgesics.',
  },
  {
    id: 'EM-2026-020', emergencyId: 'EM-2026-020',
    patientId: 'P10062', patientName: 'Rajesh Varma', age: 51, gender: 'Male',
    phone: '+91 98112 34110', arrivalTime: twoDT('05:30'),
    chiefComplaint: 'Fall on right hip — unable to bear weight, severe pain, external rotation of right leg',
    triage: 'P2 - Urgent', status: 'Admitted',
    assignedDoctor: 'Dr. Suresh Bhat', bedId: 'E-03',
    treatment: 'Pelvis X-ray: right NOF fracture. IV Morphine 2mg, Thomas splint, NBM for surgery',
    admittedAt: twoDT('06:00'),
    notes: 'Admitted to Orthopaedics. Right THA surgery done today.',
  },
  {
    id: 'EM-2026-021', emergencyId: 'EM-2026-021',
    patientId: null, patientName: 'Ajay Patel', age: 17, gender: 'Male',
    phone: '+91 97712 03355', arrivalTime: twoDT('13:00'),
    chiefComplaint: 'Alleged chemical burn to left forearm — acid splash at science lab',
    triage: 'P2 - Urgent', status: 'Referred',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-07',
    treatment: 'Irrigation with copious water 20min, Wound dressed, referred to Plastic Surgery',
    admittedAt: null,
    notes: 'Referred to Burns/Plastic Surgery OPD for further management.',
  },
  {
    id: 'EM-2026-022', emergencyId: 'EM-2026-022',
    patientId: null, patientName: 'Shantha Bai', age: 78, gender: 'Female',
    phone: '+91 96640 22100', arrivalTime: twoDT('16:45'),
    chiefComplaint: 'Altered sensorium, confusion, fever 102°F — brought by son, unable to respond',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Ananya Menon', bedId: 'E-02',
    treatment: 'IV antibiotics started empirically, blood culture, urine culture, CT Brain: no bleed',
    admittedAt: twoDT('17:00'),
    notes: 'Septic encephalopathy suspected. Admitted to Neurology ward.',
  },
  {
    id: 'EM-2026-023', emergencyId: 'EM-2026-023',
    patientId: 'P10115', patientName: 'Ananya Roy', age: 38, gender: 'Female',
    phone: '+91 98220 67001', arrivalTime: twoDT('11:30'),
    chiefComplaint: 'Hypoglycemic episode — glucose 38mg/dL, cold sweats, tremors, confusion',
    triage: 'P2 - Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Priya Sharma', bedId: 'E-05',
    treatment: 'IV Dextrose 50% 50ml, repeat glucose 96mg/dL in 20min, Biscuits given',
    admittedAt: null, dischargedAt: twoDT('13:00'),
    notes: 'Hypoglycemia resolved. Diabetes regimen adjusted. Discharged safely.',
  },
  {
    id: 'EM-2026-024', emergencyId: 'EM-2026-024',
    patientId: null, patientName: 'Ramakrishnan G', age: 63, gender: 'Male',
    phone: '+91 94410 88120', arrivalTime: twoDT('18:00'),
    chiefComplaint: 'Haematemesis — vomiting frank blood x3, volume approx 300ml, dizziness',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-01',
    treatment: '2 large-bore IVs, 1L NS rapid infusion, PPI IV drip, GI bleed protocol activated',
    admittedAt: twoDT('18:20'),
    notes: 'Suspected peptic ulcer bleed. Urgent endoscopy planned.',
  },
  {
    id: 'EM-2026-025', emergencyId: 'EM-2026-025',
    patientId: null, patientName: 'Devika Iyer', age: 32, gender: 'Female',
    phone: '+91 91100 55230', arrivalTime: twoDT('21:00'),
    chiefComplaint: 'Active labour pains — contractions every 2 min, cord prolapse suspected',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Rekha Singh', bedId: 'E-04',
    treatment: 'Obstetric emergency team activated, Trendelenburg position, Emergency LSCS prep',
    admittedAt: twoDT('21:10'),
    notes: 'Cord prolapse confirmed — emergency caesarean performed. Baby and mother stable.',
  },
  {
    id: 'EM-2026-026', emergencyId: 'EM-2026-026',
    patientId: null, patientName: 'Narayanan T', age: 48, gender: 'Male',
    phone: '+91 98110 33002', arrivalTime: twoDT('08:15'),
    chiefComplaint: 'Electric shock injury — grabbed live wire, burns on both hands, transient LOC',
    triage: 'P2 - Urgent', status: 'Discharged',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-08',
    treatment: 'ECG: normal sinus rhythm. Burns dressed. IV fluids for rhabdomyolysis prevention. CK level sent.',
    admittedAt: null, dischargedAt: twoDT('14:00'),
    notes: 'CK normal. Discharged with wound care and instructions. Follow-up 48h.',
  },
  {
    id: 'EM-2026-027', emergencyId: 'EM-2026-027',
    patientId: 'P10071', patientName: 'Ravi Shankar', age: 45, gender: 'Male',
    phone: '+91 98550 12234', arrivalTime: twoDT('14:30'),
    chiefComplaint: 'Sudden onset severe hypertensive crisis — BP 230/130, confusion, blurring',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Kiran Rao', bedId: 'E-09',
    treatment: 'IV Labetalol infusion started, target BP reduction 20-25% in 1hr, fundoscopy: papilledema',
    admittedAt: twoDT('14:50'),
    notes: 'Hypertensive emergency with end-organ damage (papilledema). Admitted to Cardiology.',
  },
  {
    id: 'EM-2026-028', emergencyId: 'EM-2026-028',
    patientId: null, patientName: 'Sumithra K', age: 55, gender: 'Female',
    phone: '+91 90330 11122', arrivalTime: twoDT('17:30'),
    chiefComplaint: 'Acute right eye pain, redness, vision blurring — sudden onset at dusk',
    triage: 'P3 - Semi-Urgent', status: 'Referred',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-05',
    treatment: 'IV Acetazolamide given, pilocarpine drops applied, urgent ophthalmology referral',
    admittedAt: null,
    notes: 'Acute angle-closure glaucoma suspected. Referred urgently to Ophthalmology.',
  },
  {
    id: 'EM-2026-029', emergencyId: 'EM-2026-029',
    patientId: null, patientName: 'Nila P (Infant)', age: 1, gender: 'Female',
    phone: '+91 98440 01123', arrivalTime: todayT('06:30'),
    chiefComplaint: 'Infant — high fever 104°F, rigid neck, photophobia, bulging fontanelle',
    triage: 'P1 - Critical', status: 'Admitted',
    assignedDoctor: 'Dr. Ananya Menon', bedId: 'E-11',
    treatment: 'IV Ceftriaxone 100mg/kg started, LP done, CSF sent for culture, IV Dexamethasone',
    admittedAt: todayT('06:45'),
    notes: 'Bacterial meningitis suspected. Admitted to Paediatric ICU.',
  },
  {
    id: 'EM-2026-030', emergencyId: 'EM-2026-030',
    patientId: null, patientName: 'Bhanu Reddy', age: 26, gender: 'Male',
    phone: '+91 93341 20080', arrivalTime: todayT('05:45'),
    chiefComplaint: 'Multi-trauma RTA — motorcycle vs truck, multiple lacerations, rib fractures, haemoptysis',
    triage: 'P1 - Critical', status: 'Under Treatment',
    assignedDoctor: 'Dr. Rahul Mehta', bedId: 'E-12',
    treatment: 'ATLS protocol activated, CT chest: haemothorax. Chest tube inserted. O2 and IV fluids.',
    admittedAt: null,
    notes: 'Major trauma — surgery team on standby. Haemothorax being drained.',
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
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const emergencyService = {
  // ── Core list method (also aliased as getCases for dashboard compat) ──────
  async getPatients(params = {}) {
    const { search = '', status = '', triage = '', page = 1, limit = 100 } = params;
    try {
      const q = new URLSearchParams({ search, status, triage, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/emergency/patients?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { patients: d.data, cases: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(e => e.patientName?.toLowerCase().includes(q) || e.emergencyId?.toLowerCase().includes(q) || e.chiefComplaint?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(e => e.status === status);
    if (triage && triage !== 'All') list = list.filter(e => e.triage === triage);
    return { patients: list.slice((page - 1) * limit, page * limit), cases: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  // Alias for dashboard compatibility
  async getCases(params = {}) {
    return this.getPatients(params);
  },

  async registerEmergency(data) {
    const list = getLocal();
    const id = `EM-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, emergencyId: id, ...data, arrivalTime: now(), status: 'Registered' };
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/patients`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, patient: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, patient: record, isLiveApi: false };
  },

  // Alias for dashboard compatibility
  async registerCase(data) {
    return this.registerEmergency(data);
  },

  async updateTriage(id, triage, notes = '') {
    const list = getLocal(); const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Emergency patient not found');
    list[idx] = { ...list[idx], triage, notes: notes || list[idx].notes, status: list[idx].status === 'Registered' ? 'Triaged' : list[idx].status, triagedAt: now() };
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status, extra = {}) {
    const list = getLocal(); const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Not found');
    list[idx] = { ...list[idx], status, ...extra };
    if (status === 'Discharged') list[idx].dischargedAt = now();
    if (status === 'Admitted') list[idx].admittedAt = now();
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },

  // Alias for dashboard compatibility
  async updateCaseStatus(id, status, extra = {}) {
    return this.updateStatus(id, status, extra);
  },
};

export default emergencyService;
