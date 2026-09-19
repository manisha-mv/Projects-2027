// services/appointmentService.js
// Phase 4 — Appointments & Reception — Service Layer
// LocalStorage-backed with REST API fallback pattern (mirrors patientService.js)

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const APT_STORE_KEY = 'neo_hms_appointments_v1';

// ─── Reference Data ──────────────────────────────────────────────────────────

export const APPOINTMENT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'Waiting',
  'In Consultation',
  'Completed',
  'Cancelled',
  'No Show',
];

export const VISIT_TYPES = ['New Visit', 'Follow-up', 'Emergency', 'Teleconsultation'];
export const PRIORITIES  = ['Routine', 'Urgent', 'Emergency'];

export const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopaedics',
  'Maternity & Gynaecology',
  'Paediatrics',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Radiology',
  'Emergency & Trauma',
  'Surgery',
];

export const MOCK_DOCTORS = [
  { id: 'D001', name: 'Dr. Priya Sharma',    department: 'General Medicine',        qualification: 'MBBS, MD', available: true },
  { id: 'D002', name: 'Dr. Kiran Rao',        department: 'Cardiology',             qualification: 'MBBS, DM (Cardiology)', available: true },
  { id: 'D003', name: 'Dr. Ananya Menon',     department: 'Neurology',              qualification: 'MBBS, DM (Neurology)', available: true },
  { id: 'D004', name: 'Dr. Rekha Singh',      department: 'Maternity & Gynaecology',qualification: 'MBBS, MS (OBG)', available: true },
  { id: 'D005', name: 'Dr. Suresh Bhat',      department: 'Orthopaedics',           qualification: 'MBBS, MS (Ortho)', available: true },
  { id: 'D006', name: 'Dr. Vikram Nair',      department: 'Paediatrics',            qualification: 'MBBS, DCH', available: true },
  { id: 'D007', name: 'Dr. Leena Joseph',     department: 'Dermatology',            qualification: 'MBBS, DVD', available: false },
  { id: 'D008', name: 'Dr. Arun Krishnan',    department: 'ENT',                   qualification: 'MBBS, MS (ENT)', available: true },
  { id: 'D009', name: 'Dr. Pooja Gupta',      department: 'Ophthalmology',          qualification: 'MBBS, DO', available: true },
  { id: 'D010', name: 'Dr. Rahul Mehta',      department: 'Emergency & Trauma',     qualification: 'MBBS, MD (Emergency)', available: true },
];

// Time slots in 30-minute intervals
export const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

// ─── Initial Seed Data ────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const INITIAL_APPOINTMENTS = [
  {
    "id": "APT-2026-100001",
    "appointmentId": "APT-2026-100001",
    "patientId": "P10025",
    "patientName": "Arun Kumar",
    "patientPhone": "+91 98450 12345",
    "doctorId": "D001",
    "doctorName": "Dr. Priya Sharma",
    "department": "General Ward",
    "appointmentDate": "2026-09-18",
    "timeSlot": "8:00 AM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "Scheduled",
    "chiefComplaint": "Consultation regarding Essential Hypertension",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10025",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100002",
    "appointmentId": "APT-2026-100002",
    "patientId": "P10041",
    "patientName": "Meena Devi",
    "patientPhone": "+91 97112 88341",
    "doctorId": "D002",
    "doctorName": "Dr. Rekha Singh",
    "department": "Maternity",
    "appointmentDate": "2026-09-18",
    "timeSlot": "8:30 AM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "Confirmed",
    "chiefComplaint": "Consultation regarding Gestational Diabetes",
    "checkinTime": null,
    "notes": "Patient ID: P10041",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100003",
    "appointmentId": "APT-2026-100003",
    "patientId": "P10067",
    "patientName": "Rajesh Nair",
    "patientPhone": "+91 94471 44520",
    "doctorId": "D003",
    "doctorName": "Dr. Kiran Rao",
    "department": "Cardiology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "9:00 AM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Checked In",
    "chiefComplaint": "Consultation regarding AMI – Post-Stent",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10067",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100004",
    "appointmentId": "APT-2026-100004",
    "patientId": "P10033",
    "patientName": "Sunita Iyer",
    "patientPhone": "+91 98860 11223",
    "doctorId": "D004",
    "doctorName": "Dr. Kiran Rao",
    "department": "Cardiology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "9:30 AM",
    "type": "Teleconsultation",
    "priority": "Routine",
    "status": "Waiting",
    "chiefComplaint": "Consultation regarding Coronary Artery Disease",
    "checkinTime": null,
    "notes": "Patient ID: P10033",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100005",
    "appointmentId": "APT-2026-100005",
    "patientId": "P10047",
    "patientName": "Prakash Nair",
    "patientPhone": "+91 98860 77123",
    "doctorId": "D005",
    "doctorName": "Dr. Ananya Menon",
    "department": "Neurology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "10:00 AM",
    "type": "Review",
    "priority": "Routine",
    "status": "In Consultation",
    "chiefComplaint": "Consultation regarding Chronic Migraine",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10047",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100006",
    "appointmentId": "APT-2026-100006",
    "patientId": "P10055",
    "patientName": "Fatima Begum",
    "patientPhone": "+91 91672 99001",
    "doctorId": "D006",
    "doctorName": "Dr. Rekha Singh",
    "department": "Maternity",
    "appointmentDate": "2026-09-18",
    "timeSlot": "10:30 AM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "Completed",
    "chiefComplaint": "Consultation regarding Labour – Active",
    "checkinTime": null,
    "notes": "Patient ID: P10055",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100007",
    "appointmentId": "APT-2026-100007",
    "patientId": "P10062",
    "patientName": "Rajesh Varma",
    "patientPhone": "+91 98230 44512",
    "doctorId": "D007",
    "doctorName": "Dr. Suresh Bhat",
    "department": "Orthopedics",
    "appointmentDate": "2026-09-18",
    "timeSlot": "11:00 AM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "Cancelled",
    "chiefComplaint": "Consultation regarding Post Hip Replacement",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10062",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100008",
    "appointmentId": "APT-2026-100008",
    "patientId": "P10069",
    "patientName": "Deepa Thomas",
    "patientPhone": "+91 97400 11223",
    "doctorId": "D008",
    "doctorName": "Dr. Rahul Mehta",
    "department": "Emergency",
    "appointmentDate": "2026-09-18",
    "timeSlot": "11:30 AM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Scheduled",
    "chiefComplaint": "Consultation regarding Acute Appendicitis",
    "checkinTime": null,
    "notes": "Patient ID: P10069",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100009",
    "appointmentId": "APT-2026-100009",
    "patientId": "P10011",
    "patientName": "Kavitha Rao",
    "patientPhone": "+91 99001 22884",
    "doctorId": "D009",
    "doctorName": "Dr. Priya Sharma",
    "department": "General Ward",
    "appointmentDate": "2026-09-18",
    "timeSlot": "12:00 PM",
    "type": "Teleconsultation",
    "priority": "Routine",
    "status": "Confirmed",
    "chiefComplaint": "Consultation regarding Hypothyroidism",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10011",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100010",
    "appointmentId": "APT-2026-100010",
    "patientId": "P10052",
    "patientName": "Mohammed Aslam",
    "patientPhone": "+91 91672 33410",
    "doctorId": "D010",
    "doctorName": "Dr. Priya Sharma",
    "department": "General Ward",
    "appointmentDate": "2026-09-18",
    "timeSlot": "12:30 PM",
    "type": "Review",
    "priority": "Routine",
    "status": "Checked In",
    "chiefComplaint": "Consultation regarding Bronchial Asthma",
    "checkinTime": null,
    "notes": "Patient ID: P10052",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100011",
    "appointmentId": "APT-2026-100011",
    "patientId": "P10018",
    "patientName": "Karthik Suresh",
    "patientPhone": "+91 98190 77654",
    "doctorId": "D001",
    "doctorName": "Dr. Ananya Menon",
    "department": "Neurology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "13:00 PM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "Waiting",
    "chiefComplaint": "Consultation regarding Seizure Disorder",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10018",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100012",
    "appointmentId": "APT-2026-100012",
    "patientId": "P10031",
    "patientName": "Lalitha Iyer",
    "patientPhone": "+91 94480 33211",
    "doctorId": "D002",
    "doctorName": "Dr. Kiran Rao",
    "department": "Cardiology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "13:30 PM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "In Consultation",
    "chiefComplaint": "Consultation regarding Hypertensive Heart Disease",
    "checkinTime": null,
    "notes": "Patient ID: P10031",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100013",
    "appointmentId": "APT-2026-100013",
    "patientId": "P10060",
    "patientName": "Sunita Pillai",
    "patientPhone": "+91 97411 88223",
    "doctorId": "D003",
    "doctorName": "Dr. Ananya Menon",
    "department": "Neurology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "14:00 PM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Completed",
    "chiefComplaint": "Consultation regarding Cervical Spondylosis",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10060",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100014",
    "appointmentId": "APT-2026-100014",
    "patientId": "P10071",
    "patientName": "Ravi Shankar",
    "patientPhone": "+91 98200 11998",
    "doctorId": "D004",
    "doctorName": "Dr. Kiran Rao",
    "department": "Cardiology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "14:30 PM",
    "type": "Teleconsultation",
    "priority": "Routine",
    "status": "Cancelled",
    "chiefComplaint": "Consultation regarding Angina Pectoris",
    "checkinTime": null,
    "notes": "Patient ID: P10071",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100015",
    "appointmentId": "APT-2026-100015",
    "patientId": "P10075",
    "patientName": "Anil Deshmukh",
    "patientPhone": "+91 98210 55443",
    "doctorId": "D005",
    "doctorName": "Dr. Priya Sharma",
    "department": "General Ward",
    "appointmentDate": "2026-09-18",
    "timeSlot": "15:00 PM",
    "type": "Review",
    "priority": "Routine",
    "status": "Scheduled",
    "chiefComplaint": "Consultation regarding Type 2 Diabetes Mellitus",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10075",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100016",
    "appointmentId": "APT-2026-100016",
    "patientId": "P10080",
    "patientName": "Pooja Hegde",
    "patientPhone": "+91 97654 32109",
    "doctorId": "D006",
    "doctorName": "Dr. Leena Joseph",
    "department": "Dermatology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "15:30 PM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "Confirmed",
    "chiefComplaint": "Consultation regarding Psoriasis Vulgaris",
    "checkinTime": null,
    "notes": "Patient ID: P10080",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100017",
    "appointmentId": "APT-2026-100017",
    "patientId": "P10085",
    "patientName": "Suresh Menon",
    "patientPhone": "+91 94470 12345",
    "doctorId": "D007",
    "doctorName": "Dr. Suresh Bhat",
    "department": "Orthopedics",
    "appointmentDate": "2026-09-18",
    "timeSlot": "16:00 PM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "Checked In",
    "chiefComplaint": "Consultation regarding Osteoarthritis Knee",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10085",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100018",
    "appointmentId": "APT-2026-100018",
    "patientId": "P10089",
    "patientName": "Lakshmi Pillai",
    "patientPhone": "+91 98450 66778",
    "doctorId": "D008",
    "doctorName": "Dr. Vikram Nair",
    "department": "Paediatrics",
    "appointmentDate": "2026-09-18",
    "timeSlot": "16:30 PM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Waiting",
    "chiefComplaint": "Consultation regarding Acute Tonsillitis",
    "checkinTime": null,
    "notes": "Patient ID: P10089",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100019",
    "appointmentId": "APT-2026-100019",
    "patientId": "P10092",
    "patientName": "Vikramaditya Roy",
    "patientPhone": "+91 98300 44332",
    "doctorId": "D009",
    "doctorName": "Dr. Sanjay Dutt",
    "department": "Urology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "17:00 PM",
    "type": "Teleconsultation",
    "priority": "Routine",
    "status": "In Consultation",
    "chiefComplaint": "Consultation regarding BPH – Benign Prostatic Hyperplasia",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10092",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100020",
    "appointmentId": "APT-2026-100020",
    "patientId": "P10098",
    "patientName": "Geetha Krishnan",
    "patientPhone": "+91 94460 77889",
    "doctorId": "D010",
    "doctorName": "Dr. Alok Verma",
    "department": "Pulmonology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "17:30 PM",
    "type": "Review",
    "priority": "Routine",
    "status": "Completed",
    "chiefComplaint": "Consultation regarding COPD Exacerbation",
    "checkinTime": null,
    "notes": "Patient ID: P10098",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100021",
    "appointmentId": "APT-2026-100021",
    "patientId": "P10102",
    "patientName": "Vikram Malhotra",
    "patientPhone": "+91 98110 99887",
    "doctorId": "D001",
    "doctorName": "Dr. Suresh Bhat",
    "department": "Orthopedics",
    "appointmentDate": "2026-09-18",
    "timeSlot": "18:00 PM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "Cancelled",
    "chiefComplaint": "Consultation regarding Right Femur Fracture",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10102",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100022",
    "appointmentId": "APT-2026-100022",
    "patientId": "P10108",
    "patientName": "Sangeetha Reddi",
    "patientPhone": "+91 98480 11223",
    "doctorId": "D002",
    "doctorName": "Dr. Rakesh Jhunjhun",
    "department": "Gastroenterology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "18:30 PM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "Scheduled",
    "chiefComplaint": "Consultation regarding Chronic Gastritis",
    "checkinTime": null,
    "notes": "Patient ID: P10108",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100023",
    "appointmentId": "APT-2026-100023",
    "patientId": "P10115",
    "patientName": "Ananya Roy",
    "patientPhone": "+91 98310 22334",
    "doctorId": "D003",
    "doctorName": "Dr. Priya Sharma",
    "department": "General Ward",
    "appointmentDate": "2026-09-18",
    "timeSlot": "19:00 PM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Confirmed",
    "chiefComplaint": "Consultation regarding Type 1 Diabetes",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10115",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100024",
    "appointmentId": "APT-2026-100024",
    "patientId": "P10120",
    "patientName": "Harish Chandra",
    "patientPhone": "+91 94150 33445",
    "doctorId": "D004",
    "doctorName": "Dr. Meera Nambiar",
    "department": "Nephrology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "19:30 PM",
    "type": "Teleconsultation",
    "priority": "Routine",
    "status": "Checked In",
    "chiefComplaint": "Consultation regarding Chronic Kidney Disease",
    "checkinTime": null,
    "notes": "Patient ID: P10120",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100025",
    "appointmentId": "APT-2026-100025",
    "patientId": "P10128",
    "patientName": "Suresh Gupta",
    "patientPhone": "+91 98100 55667",
    "doctorId": "D005",
    "doctorName": "Dr. Alok Verma",
    "department": "Pulmonology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "20:00 PM",
    "type": "Review",
    "priority": "Routine",
    "status": "Waiting",
    "chiefComplaint": "Consultation regarding Severe Bronchospasm",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10128",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100026",
    "appointmentId": "APT-2026-100026",
    "patientId": "P10135",
    "patientName": "Divya Mukhopadhyay",
    "patientPhone": "+91 98301 66778",
    "doctorId": "D006",
    "doctorName": "Dr. Shalini Das",
    "department": "Endocrinology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "20:30 PM",
    "type": "New Visit",
    "priority": "Urgent",
    "status": "In Consultation",
    "chiefComplaint": "Consultation regarding Hyperthyroidism",
    "checkinTime": null,
    "notes": "Patient ID: P10135",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100027",
    "appointmentId": "APT-2026-100027",
    "patientId": "P10140",
    "patientName": "Amitabh Saxena",
    "patientPhone": "+91 98102 77889",
    "doctorId": "D007",
    "doctorName": "Dr. Siddharth Roy",
    "department": "Oncology",
    "appointmentDate": "2026-09-18",
    "timeSlot": "21:00 PM",
    "type": "Follow-up",
    "priority": "Routine",
    "status": "Completed",
    "chiefComplaint": "Consultation regarding Chemotherapy Protocol",
    "checkinTime": "2026-09-18T18:24:03.401Z",
    "notes": "Patient ID: P10140",
    "createdAt": "2026-09-18"
  },
  {
    "id": "APT-2026-100028",
    "appointmentId": "APT-2026-100028",
    "patientId": "P10145",
    "patientName": "Rohit Shetty",
    "patientPhone": "+91 98201 88990",
    "doctorId": "D008",
    "doctorName": "Dr. Arun Krishnan",
    "department": "ENT",
    "appointmentDate": "2026-09-18",
    "timeSlot": "21:30 PM",
    "type": "Emergency",
    "priority": "Routine",
    "status": "Cancelled",
    "chiefComplaint": "Consultation regarding Chronic Sinusitis",
    "checkinTime": null,
    "notes": "Patient ID: P10145",
    "createdAt": "2026-09-18"
  }
];

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const getLocalAppointments = () => {
  try {
    const raw = localStorage.getItem(APT_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(APT_STORE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  return INITIAL_APPOINTMENTS;
};

const saveLocalAppointments = (list) => {
  try { localStorage.setItem(APT_STORE_KEY, JSON.stringify(list)); }
  catch (e) { console.error('Failed to persist appointments', e); }
};

// Generate next appointment ID
export const generateAppointmentId = () => {
  const list = getLocalAppointments();
  const year = new Date().getFullYear();
  let maxSeq = list.length + 1;
  list.forEach(a => {
    const m = a.appointmentId?.match(/\d+$/);
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[0], 10) + 1);
  });
  return `APT-${year}-${String(maxSeq).padStart(6, '0')}`;
};

// Format today's date as YYYY-MM-DD
export const toDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ─── Status helpers ───────────────────────────────────────────────────────────

export const getStatusVariant = (status) => {
  switch (status) {
    case 'Completed':       return 'success';
    case 'In Consultation': return 'primary';
    case 'Waiting':         return 'warning';
    case 'Checked In':      return 'info';
    case 'Confirmed':       return 'secondary';
    case 'Scheduled':       return 'neutral';
    case 'Cancelled':       return 'error';
    case 'No Show':         return 'error';
    default:                return 'neutral';
  }
};

export const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'Emergency': return 'error';
    case 'Urgent':    return 'warning';
    default:          return 'neutral';
  }
};

// Next allowed status transitions for each role
export const allowedTransitions = (currentStatus, role) => {
  const r = role?.toUpperCase();
  switch (currentStatus) {
    case 'Scheduled':
    case 'Confirmed':
      if (['ADMIN', 'RECEPTIONIST'].includes(r))
        return ['Confirmed', 'Checked In', 'Cancelled', 'No Show'];
      if (r === 'DOCTOR')
        return ['Cancelled'];
      return [];
    case 'Checked In':
      if (['ADMIN', 'RECEPTIONIST'].includes(r))
        return ['Waiting', 'Cancelled'];
      return [];
    case 'Waiting':
      if (['ADMIN', 'RECEPTIONIST'].includes(r))
        return ['In Consultation', 'Cancelled'];
      if (r === 'DOCTOR')
        return ['In Consultation'];
      return [];
    case 'In Consultation':
      if (['ADMIN', 'DOCTOR'].includes(r))
        return ['Completed', 'Cancelled'];
      return [];
    case 'Completed':
    case 'Cancelled':
    case 'No Show':
      return [];
    default:
      return [];
  }
};

// ─── Service Methods ──────────────────────────────────────────────────────────

export const appointmentService = {

  async getAppointments(params = {}) {
    const {
      search = '', date = '', doctorId = '', department = '', status = '',
      patientId = '', patientName = '',
      page = 1, limit = 10,
    } = params;

    // Try live API first
    try {
      const token = localStorage.getItem('token');
      const q = new URLSearchParams();
      if (search)     q.set('search', search);
      if (date)       q.set('date', date);
      if (doctorId)   q.set('doctorId', doctorId);
      if (department) q.set('department', department);
      if (status)     q.set('status', status);
      if (patientId)  q.set('patientId', patientId);
      q.set('page', page); q.set('limit', limit);

      const res = await fetch(`${API_BASE_URL}/appointments?${q}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return { appointments: data.data, total: data.pagination?.total || data.data.length, page, pages: data.pagination?.pages || 1, isLiveApi: true };
        }
      }
    } catch { /* fallback */ }

    // Local fallback
    let list = getLocalAppointments();

    if (patientId) {
      list = list.filter(a => a.patientId === patientId || (patientName && a.patientName?.toLowerCase() === patientName.toLowerCase()));
      if (list.length === 0) {
        const fallbackApt = {
          id: `APT-2026-${patientId.replace(/[^0-9]/g, '') || '000001'}`,
          appointmentId: `APT-2026-${patientId.replace(/[^0-9]/g, '') || '000001'}`,
          patientId: patientId,
          patientName: patientName || `Patient (${patientId})`,
          patientPhone: '+91 98450 12345',
          doctorId: 'D001',
          doctorName: 'Dr. Priya Sharma',
          department: 'General Medicine',
          appointmentDate: new Date().toISOString().split('T')[0],
          timeSlot: '09:30 AM',
          type: 'Follow-up',
          priority: 'Routine',
          status: 'Scheduled',
          chiefComplaint: 'Regular health consultation & vital checkup',
          checkinTime: null,
          notes: '',
          createdAt: new Date().toISOString(),
        };
        const allList = getLocalAppointments();
        allList.unshift(fallbackApt);
        saveLocalAppointments(allList);
        list = [fallbackApt];
      }
    } else if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.appointmentId?.toLowerCase().includes(q) ||
        a.patientName?.toLowerCase().includes(q) ||
        a.patientId?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q)
      );
    }
    if (date)       list = list.filter(a => a.appointmentDate === date);
    if (doctorId)   list = list.filter(a => a.doctorId === doctorId);
    if (department) list = list.filter(a => a.department === department);
    if (status)     list = list.filter(a => a.status === status);

    // Sort: today first by timeSlot, then by date desc
    list = [...list].sort((a, b) => {
      if (a.appointmentDate < b.appointmentDate) return 1;
      if (a.appointmentDate > b.appointmentDate) return -1;
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });

    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    return {
      appointments: list.slice((safePage - 1) * limit, safePage * limit),
      total, page: safePage, pages, isLiveApi: false,
    };
  },

  async getTodayAppointments(doctorId = null) {
    const today = toDateStr();
    let list = getLocalAppointments().filter(a => a.appointmentDate === today);
    if (doctorId) list = list.filter(a => a.doctorId === doctorId);
    return list.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
  },

  async getById(id) {
    const list = getLocalAppointments();
    return list.find(a => a.id === id || a.appointmentId === id) || null;
  },

  async createAppointment(data) {
    const newId = generateAppointmentId();
    const doctor = MOCK_DOCTORS.find(d => d.id === data.doctorId);
    const record = {
      id: newId, appointmentId: newId,
      patientId:    data.patientId,
      patientName:  data.patientName,
      patientPhone: data.patientPhone || '',
      doctorId:     data.doctorId,
      doctorName:   doctor?.name || data.doctorName || '',
      department:   data.department || doctor?.department || '',
      appointmentDate: data.appointmentDate,
      timeSlot:     data.timeSlot,
      type:         data.type || 'New Visit',
      priority:     data.priority || 'Routine',
      status:       'Scheduled',
      chiefComplaint: data.chiefComplaint || '',
      checkinTime:  null,
      notes:        data.notes || '',
      createdAt:    new Date().toISOString(),
    };

    // Try API
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.data) {
          const list = getLocalAppointments();
          list.unshift(resData.data);
          saveLocalAppointments(list);
          return { success: true, appointment: resData.data, isLiveApi: true };
        }
      }
    } catch { /* fallback */ }

    const list = getLocalAppointments();
    // Conflict check: same doctor + same date + same time slot
    const conflict = list.find(a =>
      a.doctorId === record.doctorId &&
      a.appointmentDate === record.appointmentDate &&
      a.timeSlot === record.timeSlot &&
      !['Cancelled', 'No Show'].includes(a.status)
    );
    if (conflict) throw new Error(`Time slot ${record.timeSlot} is already booked for ${record.doctorName} on ${record.appointmentDate}.`);

    list.unshift(record);
    saveLocalAppointments(list);
    return { success: true, appointment: record, isLiveApi: false };
  },

  async updateStatus(id, newStatus, notes = '') {
    const list = getLocalAppointments();
    const idx = list.findIndex(a => a.id === id || a.appointmentId === id);
    if (idx === -1) throw new Error('Appointment not found.');

    const updated = {
      ...list[idx],
      status: newStatus,
      notes: notes || list[idx].notes,
      checkinTime: newStatus === 'Checked In' ? new Date().toISOString() : list[idx].checkinTime,
    };

    // Try API
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.data) {
          list[idx] = resData.data;
          saveLocalAppointments(list);
          return { success: true, appointment: resData.data, isLiveApi: true };
        }
      }
    } catch { /* fallback */ }

    list[idx] = updated;
    saveLocalAppointments(list);
    return { success: true, appointment: updated, isLiveApi: false };
  },

  async updateAppointment(id, data) {
    const list = getLocalAppointments();
    const idx = list.findIndex(a => a.id === id || a.appointmentId === id);
    if (idx === -1) throw new Error('Appointment not found.');

    const doctor = MOCK_DOCTORS.find(d => d.id === (data.doctorId || list[idx].doctorId));
    const updated = {
      ...list[idx],
      ...data,
      doctorName: doctor?.name || list[idx].doctorName,
      department: data.department || doctor?.department || list[idx].department,
    };

    list[idx] = updated;
    saveLocalAppointments(list);
    return { success: true, appointment: updated, isLiveApi: false };
  },

  // Returns booked time slots for a doctor on a given date
  getBookedSlots(doctorId, date) {
    const list = getLocalAppointments();
    return list
      .filter(a =>
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        !['Cancelled', 'No Show'].includes(a.status)
      )
      .map(a => a.timeSlot);
  },

  getDoctors() { return MOCK_DOCTORS; },

  getDoctorsByDept(dept) {
    return MOCK_DOCTORS.filter(d => !dept || d.department === dept);
  },
};

export default appointmentService;
