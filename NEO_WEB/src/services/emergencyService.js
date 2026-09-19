// services/emergencyService.js
// Emergency Department — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_emergency_v3';
const token = () => localStorage.getItem('neohms_token');

const now = () => new Date().toISOString();

export const TRIAGE_LEVELS = ['P1 - Critical', 'P2 - Urgent', 'P3 - Semi-Urgent', 'P4 - Non-Urgent'];
export const EMERGENCY_STATUSES = ['Registered', 'Triaged', 'Under Treatment', 'Admitted', 'Discharged', 'Referred', 'Expired'];

const SEED = [
  {
    id: "EM-2026-101",
    emergencyId: "EM-2026-101",
    patientId: "P10025",
    patientName: "Arun Kumar",
    age: 42,
    gender: "Male",
    phone: "+91 98450 12345",
    arrivalTime: "2026-09-18T08:15:00.000Z",
    chiefComplaint: "Severe chest pain & shortness of breath",
    triage: "P1 - Critical",
    status: "Admitted",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-01",
    treatment: "Immediate ECG, oxygen support, IV nitroglycerin, cardiac monitor",
    admittedAt: "2026-09-18T09:30:00.000Z",
    dischargedAt: null,
    notes: "Transferred to Cardiology ICU"
  },
  {
    id: "EM-2026-102",
    emergencyId: "EM-2026-102",
    patientId: "P10041",
    patientName: "Meena Devi",
    age: 35,
    gender: "Female",
    phone: "+91 97112 88341",
    arrivalTime: "2026-09-18T09:15:00.000Z",
    chiefComplaint: "Acute abdominal pain & vomiting",
    triage: "P3 - Semi-Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Priya Sharma",
    bedId: "E-02",
    treatment: "IV fluids, antiemetics, abdominal ultrasound ordered",
    admittedAt: null,
    dischargedAt: null,
    notes: "Awaiting lab reports"
  },
  {
    id: "EM-2026-103",
    emergencyId: "EM-2026-103",
    patientId: "P10067",
    patientName: "Rajesh Nair",
    age: 58,
    gender: "Male",
    phone: "+91 94471 44520",
    arrivalTime: "2026-09-18T10:15:00.000Z",
    chiefComplaint: "Sudden onset right-sided weakness",
    triage: "P1 - Critical",
    status: "Admitted",
    assignedDoctor: "Dr. Ananya Menon",
    bedId: "E-03",
    treatment: "Stroke protocol, STAT CT Brain, IV thrombolysis prep",
    admittedAt: "2026-09-18T11:00:00.000Z",
    dischargedAt: null,
    notes: "Admitted under Neurology"
  },
  {
    id: "EM-2026-104",
    emergencyId: "EM-2026-104",
    patientId: "P10033",
    patientName: "Sunita Iyer",
    age: 50,
    gender: "Female",
    phone: "+91 98860 11223",
    arrivalTime: "2026-09-18T11:15:00.000Z",
    chiefComplaint: "Palpitations & dizziness",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Kiran Rao",
    bedId: "E-04",
    treatment: "Continuous telemetry monitoring, IV Beta blockers",
    admittedAt: null,
    dischargedAt: null,
    notes: "Stable heart rate achieved"
  },
  {
    id: "EM-2026-105",
    emergencyId: "EM-2026-105",
    patientId: "P10047",
    patientName: "Prakash Nair",
    age: 54,
    gender: "Male",
    phone: "+91 98860 77123",
    arrivalTime: "2026-09-18T12:15:00.000Z",
    chiefComplaint: "High grade fever & rigor",
    triage: "P3 - Semi-Urgent",
    status: "Discharged",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-05",
    treatment: "Antipyretics, blood cultures, IV fluids",
    admittedAt: null,
    dischargedAt: "2026-09-18T16:00:00.000Z",
    notes: "Discharged on oral antibiotics"
  },
  {
    id: "EM-2026-106",
    emergencyId: "EM-2026-106",
    patientId: "P10055",
    patientName: "Fatima Begum",
    age: 29,
    gender: "Female",
    phone: "+91 91672 99001",
    arrivalTime: "2026-09-18T13:15:00.000Z",
    chiefComplaint: "Labour pain with rupture of membranes",
    triage: "P2 - Urgent",
    status: "Admitted",
    assignedDoctor: "Dr. Rekha Singh",
    bedId: "E-06",
    treatment: "Fetal heart rate monitoring, transfer to Labour Suite",
    admittedAt: "2026-09-18T14:00:00.000Z",
    dischargedAt: null,
    notes: "Admitted to Maternity Ward"
  },
  {
    id: "EM-2026-107",
    emergencyId: "EM-2026-107",
    patientId: "P10062",
    patientName: "Rajesh Varma",
    age: 64,
    gender: "Male",
    phone: "+91 98230 44512",
    arrivalTime: "2026-09-18T14:15:00.000Z",
    chiefComplaint: "Right leg injury following fall",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Suresh Bhat",
    bedId: "E-07",
    treatment: "Limb splinting, analgesics, STAT X-Ray Femur",
    admittedAt: null,
    dischargedAt: null,
    notes: "Possible intertrochanteric fracture"
  },
  {
    id: "EM-2026-108",
    emergencyId: "EM-2026-108",
    patientId: "P10069",
    patientName: "Deepa Thomas",
    age: 31,
    gender: "Female",
    phone: "+91 98451 22334",
    arrivalTime: "2026-09-18T15:00:00.000Z",
    chiefComplaint: "Acute right lower quadrant pain",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-08",
    treatment: "IV analgesia, surgical consultation for appendicitis",
    admittedAt: null,
    dischargedAt: null,
    notes: "NPO maintained"
  },
  {
    id: "EM-2026-109",
    emergencyId: "EM-2026-109",
    patientId: "P10011",
    patientName: "Kavitha Rao",
    age: 44,
    gender: "Female",
    phone: "+91 98760 12345",
    arrivalTime: "2026-09-18T15:45:00.000Z",
    chiefComplaint: "Severe migraine & photophobia",
    triage: "P3 - Semi-Urgent",
    status: "Discharged",
    assignedDoctor: "Dr. Ananya Menon",
    bedId: "E-09",
    treatment: "IV NSAIDs, dark room rest, hydration",
    admittedAt: null,
    dischargedAt: "2026-09-18T18:30:00.000Z",
    notes: "Symptomatic relief achieved"
  },
  {
    id: "EM-2026-110",
    emergencyId: "EM-2026-110",
    patientId: "P10052",
    patientName: "Mohammed Aslam",
    age: 46,
    gender: "Male",
    phone: "+91 99880 55443",
    arrivalTime: "2026-09-18T16:30:00.000Z",
    chiefComplaint: "Severe asthma exacerbation & wheezing",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-10",
    treatment: "Nebulization Salbutamol + Ipratropium, IV Hydrocortisone, O2 therapy",
    admittedAt: null,
    dischargedAt: null,
    notes: "SpO2 improved to 96%"
  },
  {
    id: "EM-2026-111",
    emergencyId: "EM-2026-111",
    patientId: "P10018",
    patientName: "Karthik Suresh",
    age: 38,
    gender: "Male",
    phone: "+91 97440 33211",
    arrivalTime: "2026-09-18T17:10:00.000Z",
    chiefComplaint: "Generalized tonic-clonic seizure at home",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Ananya Menon",
    bedId: "E-11",
    treatment: "IV Lorazepam, airway management, EEG monitoring",
    admittedAt: null,
    dischargedAt: null,
    notes: "Post-ictal state, vitals stable"
  },
  {
    id: "EM-2026-112",
    emergencyId: "EM-2026-112",
    patientId: "P10031",
    patientName: "Lalitha Iyer",
    age: 67,
    gender: "Female",
    phone: "+91 98401 99887",
    arrivalTime: "2026-09-18T18:00:00.000Z",
    chiefComplaint: "Severe epistaxis & BP 210/110 mmHg",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Priya Sharma",
    bedId: "E-12",
    treatment: "Anterior nasal packing, IV Labetalol",
    admittedAt: null,
    dischargedAt: null,
    notes: "BP rechecked: 160/95 mmHg"
  },
  {
    id: "EM-2026-113",
    emergencyId: "EM-2026-113",
    patientId: "P10060",
    patientName: "Sunita Pillai",
    age: 40,
    gender: "Female",
    phone: "+91 94460 77889",
    arrivalTime: "2026-09-18T18:45:00.000Z",
    chiefComplaint: "Motorcycle accident with scalp laceration",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-13",
    treatment: "Wound debridement & suturing, Tetanus toxoid, Cervical spine X-ray",
    admittedAt: null,
    dischargedAt: null,
    notes: "No loss of consciousness reported"
  },
  {
    id: "EM-2026-114",
    emergencyId: "EM-2026-114",
    patientId: "P10071",
    patientName: "Ravi Shankar",
    age: 55,
    gender: "Male",
    phone: "+91 98100 22334",
    arrivalTime: "2026-09-18T19:20:00.000Z",
    chiefComplaint: "Unstable angina & diaphoresis",
    triage: "P1 - Critical",
    status: "Admitted",
    assignedDoctor: "Dr. Kiran Rao",
    bedId: "E-14",
    treatment: "Dual antiplatelet therapy, STAT Troponin I, heparin drip",
    admittedAt: "2026-09-18T20:15:00.000Z",
    dischargedAt: null,
    notes: "Admitted to Cardiac Cath Lab"
  },
  {
    id: "EM-2026-115",
    emergencyId: "EM-2026-115",
    patientId: "P10075",
    patientName: "Anil Deshmukh",
    age: 50,
    gender: "Male",
    phone: "+91 97650 44321",
    arrivalTime: "2026-09-18T20:00:00.000Z",
    chiefComplaint: "Hypoglycemic confusion (Blood Sugar 42 mg/dL)",
    triage: "P1 - Critical",
    status: "Discharged",
    assignedDoctor: "Dr. Priya Sharma",
    bedId: "E-15",
    treatment: "IV 25% Dextrose bolus, blood glucose monitoring",
    admittedAt: null,
    dischargedAt: "2026-09-18T22:30:00.000Z",
    notes: "Blood glucose normalized to 110 mg/dL"
  },
  {
    id: "EM-2026-116",
    emergencyId: "EM-2026-116",
    patientId: "P10080",
    patientName: "Pooja Hegde",
    age: 27,
    gender: "Female",
    phone: "+91 99001 88776",
    arrivalTime: "2026-09-18T20:45:00.000Z",
    chiefComplaint: "Acute allergic reaction & facial edema following food intake",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-16",
    treatment: "IM Epinephrine 0.3mg, IV Hydrocortisone & Pheniramine",
    admittedAt: null,
    dischargedAt: null,
    notes: "Airway patent, edema subsiding"
  },
  {
    id: "EM-2026-117",
    emergencyId: "EM-2026-117",
    patientId: "P10085",
    patientName: "Suresh Menon",
    age: 61,
    gender: "Male",
    phone: "+91 94472 11223",
    arrivalTime: "2026-09-18T21:30:00.000Z",
    chiefComplaint: "Severe flank pain radiating to groin",
    triage: "P2 - Urgent",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-17",
    treatment: "IV Tramadol, hydration, Non-contrast CT KUB",
    admittedAt: null,
    dischargedAt: null,
    notes: "Suspected renal calculus"
  },
  {
    id: "EM-2026-118",
    emergencyId: "EM-2026-118",
    patientId: "P10089",
    patientName: "Lakshmi Pillai",
    age: 6,
    gender: "Female",
    phone: "+91 99001 77233",
    arrivalTime: "2026-09-18T22:15:00.000Z",
    chiefComplaint: "Febrile seizure (Temp 102.5°F)",
    triage: "P1 - Critical",
    status: "Admitted",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-18",
    treatment: "Rectal Diazepam, cooling measures, IV paracetamol",
    admittedAt: "2026-09-18T23:00:00.000Z",
    dischargedAt: null,
    notes: "Admitted to Paediatrics"
  },
  {
    id: "EM-2026-119",
    emergencyId: "EM-2026-119",
    patientId: "P10092",
    patientName: "Vikramaditya Roy",
    age: 71,
    gender: "Male",
    phone: "+91 98300 44556",
    arrivalTime: "2026-09-18T23:00:00.000Z",
    chiefComplaint: "Acute urinary retention & bladder pain",
    triage: "P2 - Urgent",
    status: "Discharged",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-19",
    treatment: "Foley catheterization (drained 900ml urine)",
    admittedAt: null,
    dischargedAt: "2026-09-19T01:00:00.000Z",
    notes: "Referred to Urology OPD"
  },
  {
    id: "EM-2026-120",
    emergencyId: "EM-2026-120",
    patientId: "P10098",
    patientName: "Geetha Krishnan",
    age: 54,
    gender: "Female",
    phone: "+91 94475 66778",
    arrivalTime: "2026-09-19T00:15:00.000Z",
    chiefComplaint: "Hypertensive crisis (BP 220/120 mmHg)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Priya Sharma",
    bedId: "E-20",
    treatment: "IV Nitropress infusion, continuous arterial line monitoring",
    admittedAt: null,
    dischargedAt: null,
    notes: "ICU bed reserved"
  },
  {
    id: "EM-2026-121",
    emergencyId: "EM-2026-121",
    patientId: "P10102",
    patientName: "Vikram Malhotra",
    age: 33,
    gender: "Male",
    phone: "+91 98112 33445",
    arrivalTime: "2026-09-19T01:30:00.000Z",
    chiefComplaint: "Open fracture right forearm following assault",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Suresh Bhat",
    bedId: "E-01",
    treatment: "Sterile dressing, IV antibiotics & tetanus, emergency OR prep",
    admittedAt: null,
    dischargedAt: null,
    notes: "Scheduled for emergency debridement"
  },
  {
    id: "EM-2026-122",
    emergencyId: "EM-2026-122",
    patientId: "P10108",
    patientName: "Sangeetha Reddi",
    age: 45,
    gender: "Female",
    phone: "+91 98480 11223",
    arrivalTime: "2026-09-19T02:15:00.000Z",
    chiefComplaint: "Severe hematemesis (vomiting blood)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-02",
    treatment: "Large bore IV access, IV Pantoprazole & Octreotide, blood crossmatch",
    admittedAt: null,
    dischargedAt: null,
    notes: "Urgent GI endoscopy requested"
  },
  {
    id: "EM-2026-123",
    emergencyId: "EM-2026-123",
    patientId: "P10115",
    patientName: "Ananya Roy",
    age: 24,
    gender: "Female",
    phone: "+91 98310 99887",
    arrivalTime: "2026-09-19T03:00:00.000Z",
    chiefComplaint: "Diabetic ketoacidosis (Blood Sugar 450 mg/dL, Ketones +3)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Priya Sharma",
    bedId: "E-03",
    treatment: "IV Normal Saline hydration, regular insulin infusion",
    admittedAt: null,
    dischargedAt: null,
    notes: "K+ monitoring Q1H"
  },
  {
    id: "EM-2026-124",
    emergencyId: "EM-2026-124",
    patientId: "P10120",
    patientName: "Harish Chandra",
    age: 66,
    gender: "Male",
    phone: "+91 98105 44321",
    arrivalTime: "2026-09-19T04:10:00.000Z",
    chiefComplaint: "Hyperkalemia (K+ 6.8 mEq/L) with ECG changes",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-04",
    treatment: "IV Calcium gluconate, Insulin + Dextrose, Salbutamol nebulization",
    admittedAt: null,
    dischargedAt: null,
    notes: "STAT nephrology consult for hemodialysis"
  },
  {
    id: "EM-2026-125",
    emergencyId: "EM-2026-125",
    patientId: "P10128",
    patientName: "Suresh Gupta",
    age: 59,
    gender: "Male",
    phone: "+91 98711 22334",
    arrivalTime: "2026-09-19T05:20:00.000Z",
    chiefComplaint: "Acute syncope & bradycardia (HR 32 bpm)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Kiran Rao",
    bedId: "E-05",
    treatment: "IV Atropine 0.5mg, transcutaneous pacing prep",
    admittedAt: null,
    dischargedAt: null,
    notes: "Temporary pacemaker insertion planned"
  },
  {
    id: "EM-2026-126",
    emergencyId: "EM-2026-126",
    patientId: "P10135",
    patientName: "Divya Mukhopadhyay",
    age: 37,
    gender: "Female",
    phone: "+91 98302 11223",
    arrivalTime: "2026-09-19T06:00:00.000Z",
    chiefComplaint: "Thyroid storm symptoms (Fever 103°F, Tachycardia 150 bpm)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-06",
    treatment: "Propylthiouracil, Propranolol, Hydrocortisone, cooling blanket",
    admittedAt: null,
    dischargedAt: null,
    notes: "ICU transfer arranged"
  },
  {
    id: "EM-2026-127",
    emergencyId: "EM-2026-127",
    patientId: "P10140",
    patientName: "Amitabh Saxena",
    age: 60,
    gender: "Male",
    phone: "+91 98101 88776",
    arrivalTime: "2026-09-19T07:15:00.000Z",
    chiefComplaint: "Neutropenic fever post chemotherapy (ANC < 500)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-07",
    treatment: "Broad spectrum IV Piperacillin-Tazobactam, isolation protocol",
    admittedAt: null,
    dischargedAt: null,
    notes: "STAT blood cultures sent"
  },
  {
    id: "EM-2026-128",
    emergencyId: "EM-2026-128",
    patientId: "P10145",
    patientName: "Rohit Shetty",
    age: 41,
    gender: "Male",
    phone: "+91 98200 33445",
    arrivalTime: "2026-09-19T08:00:00.000Z",
    chiefComplaint: "Corneal chemical burn (alkali splash)",
    triage: "P1 - Critical",
    status: "Under Treatment",
    assignedDoctor: "Dr. Rahul Mehta",
    bedId: "E-08",
    treatment: "Immediate Morgan lens eye irrigation with 2L Normal Saline, pH testing",
    admittedAt: null,
    dischargedAt: null,
    notes: "Ophthalmology emergency consult"
  }
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

export const emergencyService = {
  async getPatients(params = {}) {
    const { search = '', status = '', triage = '', page = 1, limit = 100 } = params;
    try {
      const q = new URLSearchParams({ search, status, triage, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/emergency/patients?${q}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { patients: d.data, cases: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getLocal();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.patientName?.toLowerCase().includes(q) || e.emergencyId?.toLowerCase().includes(q) || e.chiefComplaint?.toLowerCase().includes(q));
    }
    if (status && status !== 'All') list = list.filter(e => e.status === status);
    if (triage && triage !== 'All') list = list.filter(e => e.triage === triage);
    return { patients: list.slice((page - 1) * limit, page * limit), cases: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async getCases(params = {}) {
    return this.getPatients(params);
  },

  async registerEmergency(data) {
    const list = getLocal();
    const id = `EM-${new Date().getFullYear()}-${String(list.length + 101).padStart(3, '0')}`;
    const record = { id, emergencyId: id, ...data, arrivalTime: now(), status: 'Registered' };
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/patients`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          list.unshift(d.data);
          saveLocal(list);
          return { success: true, patient: d.data, isLiveApi: true };
        }
      }
    } catch { /* */ }

    list.unshift(record);
    saveLocal(list);
    return { success: true, patient: record, isLiveApi: false };
  },

  async registerCase(data) {
    return this.registerEmergency(data);
  },

  async updateTriage(id, triage, notes = '') {
    const list = getLocal();
    const idx = list.findIndex(e => e.id === id || e.emergencyId === id);
    if (idx === -1) throw new Error('Emergency patient not found');
    list[idx] = { ...list[idx], triage, notes: notes || list[idx].notes, status: list[idx].status === 'Registered' ? 'Triaged' : list[idx].status, triagedAt: now() };
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },

  async updateStatus(id, status, extra = {}) {
    const list = getLocal();
    const idx = list.findIndex(e => e.id === id || e.emergencyId === id);
    if (idx === -1) throw new Error('Not found');
    list[idx] = { ...list[idx], status, ...extra };
    if (status === 'Discharged') list[idx].dischargedAt = now();
    if (status === 'Admitted') list[idx].admittedAt = now();
    saveLocal(list);
    return { success: true, patient: list[idx], isLiveApi: false };
  },

  async updateCaseStatus(id, status, extra = {}) {
    return this.updateStatus(id, status, extra);
  },
};

export default emergencyService;
