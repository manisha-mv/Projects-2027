// services/ipdService.js
// IPD / Inpatient — beds, admissions, transfers — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const ADM_KEY  = 'neo_hms_ipd_admissions_v3';
const BED_KEY  = 'neo_hms_ipd_beds_v3';
const token = () => localStorage.getItem('neohms_token');

export const WARD_TYPES = [
  'General Ward',
  'Cardiology ICU',
  'Neurology',
  'Maternity',
  'Orthopaedics',
  'Paediatrics',
  'Emergency',
  'Surgical ICU',
  'Pulmonology',
  'Nephrology'
];

const SEED_BEDS = [
  { id: 'GW-01', bedId: 'GW-01', ward: 'General Ward', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'GW-02', bedId: 'GW-02', ward: 'General Ward', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'GW-03', bedId: 'GW-03', ward: 'General Ward', type: 'Standard', status: 'Maintenance', patientId: null, patientName: null },
  { id: 'GW-04', bedId: 'GW-04', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10025', patientName: 'Arun Kumar' },
  { id: 'GW-05', bedId: 'GW-05', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10052', patientName: 'Mohammed Aslam' },
  { id: 'GW-10', bedId: 'GW-10', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10075', patientName: 'Anil Deshmukh' },
  { id: 'GW-12', bedId: 'GW-12', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10115', patientName: 'Ananya Roy' },
  { id: 'GW-15', bedId: 'GW-15', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10011', patientName: 'Kavitha Rao' },
  { id: 'CAR-01', bedId: 'CAR-01', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10155', patientName: 'Venkat Raman' },
  { id: 'CAR-02', bedId: 'CAR-02', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10033', patientName: 'Sunita Iyer' },
  { id: 'CAR-05', bedId: 'CAR-05', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10031', patientName: 'Lalitha Iyer' },
  { id: 'CAR-08', bedId: 'CAR-08', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10071', patientName: 'Ravi Shankar' },
  { id: 'ICU-02', bedId: 'ICU-02', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10067', patientName: 'Rajesh Nair' },
  { id: 'NEU-01', bedId: 'NEU-01', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10060', patientName: 'Sunita Pillai' },
  { id: 'NEU-03', bedId: 'NEU-03', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10018', patientName: 'Karthik Suresh' },
  { id: 'NEU-07', bedId: 'NEU-07', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10047', patientName: 'Prakash Nair' },
  { id: 'NEU-08', bedId: 'NEU-08', ward: 'Neurology', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'MAT-01', bedId: 'MAT-01', ward: 'Maternity', type: 'Maternity', status: 'Occupied', patientId: 'P10055', patientName: 'Fatima Begum' },
  { id: 'MAT-03', bedId: 'MAT-03', ward: 'Maternity', type: 'Maternity', status: 'Occupied', patientId: 'P10041', patientName: 'Meena Devi' },
  { id: 'ORT-04', bedId: 'ORT-04', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10085', patientName: 'Suresh Menon' },
  { id: 'ORT-05', bedId: 'ORT-05', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10102', patientName: 'Vikram Malhotra' },
  { id: 'ORT-11', bedId: 'ORT-11', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10062', patientName: 'Rajesh Varma' },
  { id: 'PW-01', bedId: 'PW-01', ward: 'Paediatrics', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'PW-02', bedId: 'PW-02', ward: 'Paediatrics', type: 'Standard', status: 'Occupied', patientId: 'P10089', patientName: 'Lakshmi Pillai' },
  { id: 'E-07', bedId: 'E-07', ward: 'Emergency', type: 'Emergency', status: 'Occupied', patientId: 'P10069', patientName: 'Deepa Thomas' },
  { id: 'E-08', bedId: 'E-08', ward: 'Emergency', type: 'Emergency', status: 'Available', patientId: null, patientName: null },
  { id: 'SICU-01', bedId: 'SICU-01', ward: 'Surgical ICU', type: 'ICU', status: 'Occupied', patientId: 'P10150', patientName: 'Farida Khan' },
  { id: 'PUL-02', bedId: 'PUL-02', ward: 'Pulmonology', type: 'Standard', status: 'Occupied', patientId: 'P10098', patientName: 'Geetha Krishnan' },
  { id: 'PUL-04', bedId: 'PUL-04', ward: 'Pulmonology', type: 'Standard', status: 'Occupied', patientId: 'P10128', patientName: 'Suresh Gupta' },
  { id: 'NEP-01', bedId: 'NEP-01', ward: 'Nephrology', type: 'Standard', status: 'Occupied', patientId: 'P10120', patientName: 'Harish Chandra' },
];

const SEED_ADMISSIONS = [
  {
    id: "ADM-2026-101",
    admissionId: "ADM-2026-101",
    patientId: "P10025",
    patientName: "Arun Kumar",
    patientAge: 42,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-04",
    attendingDoctor: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    diagnosis: "Essential Hypertension",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-102",
    admissionId: "ADM-2026-102",
    patientId: "P10041",
    patientName: "Meena Devi",
    patientAge: 35,
    patientGender: "Female",
    ward: "Maternity",
    bedId: "MAT-03",
    attendingDoctor: "Dr. Rekha Singh",
    doctorName: "Dr. Rekha Singh",
    diagnosis: "Gestational Diabetes",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Maternity"
  },
  {
    id: "ADM-2026-103",
    admissionId: "ADM-2026-103",
    patientId: "P10067",
    patientName: "Rajesh Nair",
    patientAge: 58,
    patientGender: "Male",
    ward: "Cardiology ICU",
    bedId: "ICU-02",
    attendingDoctor: "Dr. Kiran Rao",
    doctorName: "Dr. Kiran Rao",
    diagnosis: "AMI – Post-Stent",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 3,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Cardiology ICU"
  },
  {
    id: "ADM-2026-104",
    admissionId: "ADM-2026-104",
    patientId: "P10033",
    patientName: "Sunita Iyer",
    patientAge: 50,
    patientGender: "Female",
    ward: "Cardiology ICU",
    bedId: "CAR-02",
    attendingDoctor: "Dr. Kiran Rao",
    doctorName: "Dr. Kiran Rao",
    diagnosis: "Coronary Artery Disease",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 4,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Cardiology ICU"
  },
  {
    id: "ADM-2026-105",
    admissionId: "ADM-2026-105",
    patientId: "P10047",
    patientName: "Prakash Nair",
    patientAge: 54,
    patientGender: "Male",
    ward: "Neurology",
    bedId: "NEU-07",
    attendingDoctor: "Dr. Ananya Menon",
    doctorName: "Dr. Ananya Menon",
    diagnosis: "Chronic Migraine",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 5,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Neurology"
  },
  {
    id: "ADM-2026-106",
    admissionId: "ADM-2026-106",
    patientId: "P10055",
    patientName: "Fatima Begum",
    patientAge: 29,
    patientGender: "Female",
    ward: "Maternity",
    bedId: "MAT-01",
    attendingDoctor: "Dr. Rekha Singh",
    doctorName: "Dr. Rekha Singh",
    diagnosis: "Labour – Active",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 6,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Maternity"
  },
  {
    id: "ADM-2026-107",
    admissionId: "ADM-2026-107",
    patientId: "P10062",
    patientName: "Rajesh Varma",
    patientAge: 64,
    patientGender: "Male",
    ward: "Orthopaedics",
    bedId: "ORT-11",
    attendingDoctor: "Dr. Suresh Bhat",
    doctorName: "Dr. Suresh Bhat",
    diagnosis: "Post Hip Replacement",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Orthopaedics"
  },
  {
    id: "ADM-2026-108",
    admissionId: "ADM-2026-108",
    patientId: "P10069",
    patientName: "Deepa Thomas",
    patientAge: 31,
    patientGender: "Female",
    ward: "Emergency",
    bedId: "E-07",
    attendingDoctor: "Dr. Rahul Mehta",
    doctorName: "Dr. Rahul Mehta",
    diagnosis: "Acute Appendicitis",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Emergency"
  },
  {
    id: "ADM-2026-109",
    admissionId: "ADM-2026-109",
    patientId: "P10011",
    patientName: "Kavitha Rao",
    patientAge: 44,
    patientGender: "Female",
    ward: "General Ward",
    bedId: "GW-15",
    attendingDoctor: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    diagnosis: "Hypothyroidism",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 3,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-110",
    admissionId: "ADM-2026-110",
    patientId: "P10052",
    patientName: "Mohammed Aslam",
    patientAge: 46,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-05",
    attendingDoctor: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    diagnosis: "Bronchial Asthma",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 4,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-111",
    admissionId: "ADM-2026-111",
    patientId: "P10018",
    patientName: "Karthik Suresh",
    patientAge: 38,
    patientGender: "Male",
    ward: "Neurology",
    bedId: "NEU-03",
    attendingDoctor: "Dr. Ananya Menon",
    doctorName: "Dr. Ananya Menon",
    diagnosis: "Seizure Disorder",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 5,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Neurology"
  },
  {
    id: "ADM-2026-112",
    admissionId: "ADM-2026-112",
    patientId: "P10031",
    patientName: "Lalitha Iyer",
    patientAge: 67,
    patientGender: "Female",
    ward: "Cardiology ICU",
    bedId: "CAR-05",
    attendingDoctor: "Dr. Kiran Rao",
    doctorName: "Dr. Kiran Rao",
    diagnosis: "Hypertensive Heart Disease",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 6,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Cardiology ICU"
  },
  {
    id: "ADM-2026-113",
    admissionId: "ADM-2026-113",
    patientId: "P10060",
    patientName: "Sunita Pillai",
    patientAge: 40,
    patientGender: "Female",
    ward: "Neurology",
    bedId: "NEU-01",
    attendingDoctor: "Dr. Ananya Menon",
    doctorName: "Dr. Ananya Menon",
    diagnosis: "Cervical Spondylosis",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Neurology"
  },
  {
    id: "ADM-2026-114",
    admissionId: "ADM-2026-114",
    patientId: "P10071",
    patientName: "Ravi Shankar",
    patientAge: 55,
    patientGender: "Male",
    ward: "Cardiology ICU",
    bedId: "CAR-08",
    attendingDoctor: "Dr. Kiran Rao",
    doctorName: "Dr. Kiran Rao",
    diagnosis: "Angina Pectoris",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Cardiology ICU"
  },
  {
    id: "ADM-2026-115",
    admissionId: "ADM-2026-115",
    patientId: "P10075",
    patientName: "Anil Deshmukh",
    patientAge: 50,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-10",
    attendingDoctor: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    diagnosis: "Type 2 Diabetes Mellitus",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 3,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-116",
    admissionId: "ADM-2026-116",
    patientId: "P10080",
    patientName: "Pooja Hegde",
    patientAge: 27,
    patientGender: "Female",
    ward: "General Ward",
    bedId: "GW-01",
    attendingDoctor: "Dr. Leena Joseph",
    doctorName: "Dr. Leena Joseph",
    diagnosis: "Psoriasis Vulgaris",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 4,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-117",
    admissionId: "ADM-2026-117",
    patientId: "P10085",
    patientName: "Suresh Menon",
    patientAge: 61,
    patientGender: "Male",
    ward: "Orthopaedics",
    bedId: "ORT-04",
    attendingDoctor: "Dr. Suresh Bhat",
    doctorName: "Dr. Suresh Bhat",
    diagnosis: "Osteoarthritis Knee",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 5,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Orthopaedics"
  },
  {
    id: "ADM-2026-118",
    admissionId: "ADM-2026-118",
    patientId: "P10089",
    patientName: "Lakshmi Pillai",
    patientAge: 6,
    patientGender: "Female",
    ward: "Paediatrics",
    bedId: "PW-02",
    attendingDoctor: "Dr. Vikram Nair",
    doctorName: "Dr. Vikram Nair",
    diagnosis: "Acute Tonsillitis",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 6,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Paediatrics"
  },
  {
    id: "ADM-2026-119",
    admissionId: "ADM-2026-119",
    patientId: "P10092",
    patientName: "Vikramaditya Roy",
    patientAge: 71,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-02",
    attendingDoctor: "Dr. Sanjay Dutt",
    doctorName: "Dr. Sanjay Dutt",
    diagnosis: "BPH – Benign Prostatic Hyperplasia",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-120",
    admissionId: "ADM-2026-120",
    patientId: "P10098",
    patientName: "Geetha Krishnan",
    patientAge: 54,
    patientGender: "Female",
    ward: "Pulmonology",
    bedId: "PUL-02",
    attendingDoctor: "Dr. Alok Verma",
    doctorName: "Dr. Alok Verma",
    diagnosis: "COPD Exacerbation",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Pulmonology"
  },
  {
    id: "ADM-2026-121",
    admissionId: "ADM-2026-121",
    patientId: "P10102",
    patientName: "Vikram Malhotra",
    patientAge: 33,
    patientGender: "Male",
    ward: "Orthopaedics",
    bedId: "ORT-05",
    attendingDoctor: "Dr. Suresh Bhat",
    doctorName: "Dr. Suresh Bhat",
    diagnosis: "Right Femur Fracture",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 3,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Orthopaedics"
  },
  {
    id: "ADM-2026-122",
    admissionId: "ADM-2026-122",
    patientId: "P10108",
    patientName: "Sangeetha Reddi",
    patientAge: 45,
    patientGender: "Female",
    ward: "General Ward",
    bedId: "GW-03",
    attendingDoctor: "Dr. Rakesh Jhunjhun",
    doctorName: "Dr. Rakesh Jhunjhun",
    diagnosis: "Chronic Gastritis",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 4,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-123",
    admissionId: "ADM-2026-123",
    patientId: "P10115",
    patientName: "Ananya Roy",
    patientAge: 24,
    patientGender: "Female",
    ward: "General Ward",
    bedId: "GW-12",
    attendingDoctor: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    diagnosis: "Type 1 Diabetes",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 5,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-124",
    admissionId: "ADM-2026-124",
    patientId: "P10120",
    patientName: "Harish Chandra",
    patientAge: 66,
    patientGender: "Male",
    ward: "Nephrology",
    bedId: "NEP-01",
    attendingDoctor: "Dr. Meera Nambiar",
    doctorName: "Dr. Meera Nambiar",
    diagnosis: "Chronic Kidney Disease",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 6,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Nephrology"
  },
  {
    id: "ADM-2026-125",
    admissionId: "ADM-2026-125",
    patientId: "P10128",
    patientName: "Suresh Gupta",
    patientAge: 59,
    patientGender: "Male",
    ward: "Pulmonology",
    bedId: "PUL-04",
    attendingDoctor: "Dr. Alok Verma",
    doctorName: "Dr. Alok Verma",
    diagnosis: "Severe Bronchospasm",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Pulmonology"
  },
  {
    id: "ADM-2026-126",
    admissionId: "ADM-2026-126",
    patientId: "P10135",
    patientName: "Divya Mukhopadhyay",
    patientAge: 37,
    patientGender: "Female",
    ward: "General Ward",
    bedId: "GW-01",
    attendingDoctor: "Dr. Shalini Das",
    doctorName: "Dr. Shalini Das",
    diagnosis: "Hyperthyroidism",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-127",
    admissionId: "ADM-2026-127",
    patientId: "P10140",
    patientName: "Amitabh Saxena",
    patientAge: 60,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-02",
    attendingDoctor: "Dr. Siddharth Roy",
    doctorName: "Dr. Siddharth Roy",
    diagnosis: "Chemotherapy Protocol",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 3,
    condition: "Stable",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-128",
    admissionId: "ADM-2026-128",
    patientId: "P10145",
    patientName: "Rohit Shetty",
    patientAge: 41,
    patientGender: "Male",
    ward: "General Ward",
    bedId: "GW-03",
    attendingDoctor: "Dr. Arun Krishnan",
    doctorName: "Dr. Arun Krishnan",
    diagnosis: "Chronic Sinusitis",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 4,
    condition: "Serious",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in General Ward"
  },
  {
    id: "ADM-2026-129",
    admissionId: "ADM-2026-129",
    patientId: "P10150",
    patientName: "Farida Khan",
    patientAge: 49,
    patientGender: "Female",
    ward: "Surgical ICU",
    bedId: "SICU-01",
    attendingDoctor: "Dr. Preeti Deshmukh",
    doctorName: "Dr. Preeti Deshmukh",
    diagnosis: "Post-Op Cholecystectomy",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 2,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Tomorrow",
    notes: "Active IPD admission in Surgical ICU"
  },
  {
    id: "ADM-2026-130",
    admissionId: "ADM-2026-130",
    patientId: "P10155",
    patientName: "Venkat Raman",
    patientAge: 62,
    patientGender: "Male",
    ward: "Cardiology ICU",
    bedId: "CAR-01",
    attendingDoctor: "Dr. Kiran Rao",
    doctorName: "Dr. Kiran Rao",
    diagnosis: "Acute Coronary Syndrome",
    admittedDate: "2026-09-18",
    admitDate: "2026-09-18",
    daysAdmitted: 1,
    condition: "Critical",
    status: "Admitted",
    dischargePlanned: "Pending",
    notes: "Active IPD admission in Cardiology ICU"
  }
];

const getL = (key, seed) => {
  try {
    const d = localStorage.getItem(key);
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length >= seed.length) {
        return parsed;
      }
    }
  } catch { /* */ }
  try { localStorage.setItem(key, JSON.stringify(seed)); } catch { /* */ }
  return seed;
};

const saveL = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* */ }
};

const h = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {})
});

export const ipdService = {
  async getAdmissions(params = {}) {
    const { search = '', ward = '', status = '', page = 1, limit = 50 } = params;
    try {
      const q = new URLSearchParams({ search, ward, status, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/ipd/admissions?${q}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { admissions: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getL(ADM_KEY, SEED_ADMISSIONS);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.patientName?.toLowerCase().includes(q) || a.patientId?.toLowerCase().includes(q) || a.admissionId?.toLowerCase().includes(q));
    }
    if (ward && ward !== 'All') list = list.filter(a => a.ward === ward);
    if (status && status !== 'All') {
      list = list.filter(a =>
        a.status === status ||
        (status === 'Active' && (a.status === 'Admitted' || a.status === 'Active')) ||
        (status === 'Admitted' && (a.status === 'Active' || a.status === 'Admitted'))
      );
    }
    return { admissions: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async getBeds(ward = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/ipd/beds${ward ? `?ward=${ward}` : ''}`, { headers: h() });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return { beds: d.data, isLiveApi: true };
      }
    } catch { /* */ }

    let list = getL(BED_KEY, SEED_BEDS);
    if (ward) list = list.filter(b => b.ward === ward);
    const stats = {
      total: list.length,
      available: list.filter(b => b.status === 'Available').length,
      occupied: list.filter(b => b.status === 'Occupied').length,
      maintenance: list.filter(b => b.status === 'Maintenance').length
    };
    return { beds: list, stats, isLiveApi: false };
  },

  async admitPatient(data) {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const id = `ADM-2026-${String(admissions.length + 101).padStart(3, '0')}`;
    const record = {
      id,
      admissionId: id,
      ...data,
      doctorName: data.doctorName || data.attendingDoctor || 'Dr. Priya Sharma',
      admitDate: new Date().toISOString().split('T')[0],
      admittedDate: new Date().toISOString().split('T')[0],
      daysAdmitted: 1,
      status: 'Admitted'
    };
    try {
      const res = await fetch(`${API_BASE_URL}/ipd/admissions`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          admissions.unshift(d.data);
          saveL(ADM_KEY, admissions);
          return { success: true, admission: d.data, isLiveApi: true };
        }
      }
    } catch { /* */ }

    admissions.unshift(record);
    const bedIdx = beds.findIndex(b => b.id === data.bedId || b.bedId === data.bedId);
    if (bedIdx !== -1) {
      beds[bedIdx] = { ...beds[bedIdx], status: 'Occupied', patientId: data.patientId, patientName: data.patientName };
      saveL(BED_KEY, beds);
    }
    saveL(ADM_KEY, admissions);
    return { success: true, admission: record, isLiveApi: false };
  },

  async transferPatient(admissionId, newBedId, notes = '') {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const idx = admissions.findIndex(a => a.id === admissionId || a.admissionId === admissionId);
    if (idx === -1) throw new Error('Admission not found');

    try {
      const res = await fetch(`${API_BASE_URL}/ipd/admissions/${admissionId}/transfer`, { method: 'PUT', headers: h(), body: JSON.stringify({ newBedId, notes }) });
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          admissions[idx] = d.data;
          saveL(ADM_KEY, admissions);
          return { success: true, isLiveApi: true };
        }
      }
    } catch { /* */ }

    const oldBedIdx = beds.findIndex(b => b.id === admissions[idx].bedId || b.bedId === admissions[idx].bedId);
    const newBedIdx = beds.findIndex(b => b.id === newBedId || b.bedId === newBedId);
    if (oldBedIdx !== -1) beds[oldBedIdx] = { ...beds[oldBedIdx], status: 'Available', patientId: null, patientName: null };
    if (newBedIdx !== -1) beds[newBedIdx] = { ...beds[newBedIdx], status: 'Occupied', patientId: admissions[idx].patientId, patientName: admissions[idx].patientName };
    admissions[idx] = { ...admissions[idx], bedId: newBedId, ward: beds[newBedIdx]?.ward || admissions[idx].ward, notes };
    saveL(ADM_KEY, admissions);
    saveL(BED_KEY, beds);
    return { success: true, isLiveApi: false };
  },

  async dischargePatient(admissionId) {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const idx = admissions.findIndex(a => a.id === admissionId || a.admissionId === admissionId);
    if (idx === -1) throw new Error('Admission not found');

    admissions[idx] = { ...admissions[idx], status: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] };
    const bedIdx = beds.findIndex(b => b.id === admissions[idx].bedId || b.bedId === admissions[idx].bedId);
    if (bedIdx !== -1) beds[bedIdx] = { ...beds[bedIdx], status: 'Available', patientId: null, patientName: null };
    saveL(ADM_KEY, admissions);
    saveL(BED_KEY, beds);
    return { success: true, isLiveApi: false };
  },
};

export default ipdService;
