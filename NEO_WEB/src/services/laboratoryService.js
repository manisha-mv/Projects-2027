// services/laboratoryService.js
// Laboratory module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_lab_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];

export const LAB_TEST_TYPES = ['CBC', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Profile', 'Urine Routine', 'Culture & Sensitivity', 'Troponin I', 'D-Dimer', 'HbA1c', 'ESR', 'CRP', 'Electrolytes', 'Blood Group & Cross-match'];
export const LAB_ORDER_STATUSES = ['Pending', 'Sample Collected', 'Processing', 'Result Entered', 'Verified', 'Completed', 'Cancelled'];
export const SAMPLE_TYPES = ['Blood', 'Urine', 'Stool', 'Sputum', 'Swab', 'CSF', 'Tissue'];
export const URGENCY_TYPES = ['Routine', 'Urgent', 'STAT'];

const SEED_ORDERS = [
  {
    "id": "LAB-2026-101",
    "orderId": "LAB-2026-101",
    "patientId": "P10025",
    "patientName": "Arun Kumar",
    "doctorId": "D01",
    "doctorName": "Dr. Priya Sharma",
    "testName": "CBC",
    "sampleType": "Urine",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "CBC normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Essential Hypertension"
  },
  {
    "id": "LAB-2026-102",
    "orderId": "LAB-2026-102",
    "patientId": "P10041",
    "patientName": "Meena Devi",
    "doctorId": "D02",
    "doctorName": "Dr. Rekha Singh",
    "testName": "Blood Sugar",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Gestational Diabetes"
  },
  {
    "id": "LAB-2026-103",
    "orderId": "LAB-2026-103",
    "patientId": "P10067",
    "patientName": "Rajesh Nair",
    "doctorId": "D03",
    "doctorName": "Dr. Kiran Rao",
    "testName": "Lipid Profile",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Lipid Profile normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for AMI – Post-Stent"
  },
  {
    "id": "LAB-2026-104",
    "orderId": "LAB-2026-104",
    "patientId": "P10033",
    "patientName": "Sunita Iyer",
    "doctorId": "D04",
    "doctorName": "Dr. Kiran Rao",
    "testName": "Liver Function",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Pending",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Coronary Artery Disease"
  },
  {
    "id": "LAB-2026-105",
    "orderId": "LAB-2026-105",
    "patientId": "P10047",
    "patientName": "Prakash Nair",
    "doctorId": "D05",
    "doctorName": "Dr. Ananya Menon",
    "testName": "Kidney Function",
    "sampleType": "Urine",
    "urgency": "Routine",
    "status": "Verified",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Kidney Function normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Chronic Migraine"
  },
  {
    "id": "LAB-2026-106",
    "orderId": "LAB-2026-106",
    "patientId": "P10055",
    "patientName": "Fatima Begum",
    "doctorId": "D01",
    "doctorName": "Dr. Rekha Singh",
    "testName": "Thyroid Profile",
    "sampleType": "Blood",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Labour – Active"
  },
  {
    "id": "LAB-2026-107",
    "orderId": "LAB-2026-107",
    "patientId": "P10062",
    "patientName": "Rajesh Varma",
    "doctorId": "D02",
    "doctorName": "Dr. Suresh Bhat",
    "testName": "Urine Routine",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Urine Routine normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Post Hip Replacement"
  },
  {
    "id": "LAB-2026-108",
    "orderId": "LAB-2026-108",
    "patientId": "P10069",
    "patientName": "Deepa Thomas",
    "doctorId": "D03",
    "doctorName": "Dr. Rahul Mehta",
    "testName": "Culture & Sensitivity",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Acute Appendicitis"
  },
  {
    "id": "LAB-2026-109",
    "orderId": "LAB-2026-109",
    "patientId": "P10011",
    "patientName": "Kavitha Rao",
    "doctorId": "D04",
    "doctorName": "Dr. Priya Sharma",
    "testName": "Troponin I",
    "sampleType": "Urine",
    "urgency": "Routine",
    "status": "Pending",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Troponin I normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Hypothyroidism"
  },
  {
    "id": "LAB-2026-110",
    "orderId": "LAB-2026-110",
    "patientId": "P10052",
    "patientName": "Mohammed Aslam",
    "doctorId": "D05",
    "doctorName": "Dr. Priya Sharma",
    "testName": "D-Dimer",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Verified",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Bronchial Asthma"
  },
  {
    "id": "LAB-2026-111",
    "orderId": "LAB-2026-111",
    "patientId": "P10018",
    "patientName": "Karthik Suresh",
    "doctorId": "D01",
    "doctorName": "Dr. Ananya Menon",
    "testName": "CBC",
    "sampleType": "Blood",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "CBC normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Seizure Disorder"
  },
  {
    "id": "LAB-2026-112",
    "orderId": "LAB-2026-112",
    "patientId": "P10031",
    "patientName": "Lalitha Iyer",
    "doctorId": "D02",
    "doctorName": "Dr. Kiran Rao",
    "testName": "Blood Sugar",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Hypertensive Heart Disease"
  },
  {
    "id": "LAB-2026-113",
    "orderId": "LAB-2026-113",
    "patientId": "P10060",
    "patientName": "Sunita Pillai",
    "doctorId": "D03",
    "doctorName": "Dr. Ananya Menon",
    "testName": "Lipid Profile",
    "sampleType": "Urine",
    "urgency": "Urgent",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Lipid Profile normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Cervical Spondylosis"
  },
  {
    "id": "LAB-2026-114",
    "orderId": "LAB-2026-114",
    "patientId": "P10071",
    "patientName": "Ravi Shankar",
    "doctorId": "D04",
    "doctorName": "Dr. Kiran Rao",
    "testName": "Liver Function",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Pending",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Angina Pectoris"
  },
  {
    "id": "LAB-2026-115",
    "orderId": "LAB-2026-115",
    "patientId": "P10075",
    "patientName": "Anil Deshmukh",
    "doctorId": "D05",
    "doctorName": "Dr. Priya Sharma",
    "testName": "Kidney Function",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Verified",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Kidney Function normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Type 2 Diabetes Mellitus"
  },
  {
    "id": "LAB-2026-116",
    "orderId": "LAB-2026-116",
    "patientId": "P10080",
    "patientName": "Pooja Hegde",
    "doctorId": "D01",
    "doctorName": "Dr. Leena Joseph",
    "testName": "Thyroid Profile",
    "sampleType": "Blood",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Psoriasis Vulgaris"
  },
  {
    "id": "LAB-2026-117",
    "orderId": "LAB-2026-117",
    "patientId": "P10085",
    "patientName": "Suresh Menon",
    "doctorId": "D02",
    "doctorName": "Dr. Suresh Bhat",
    "testName": "Urine Routine",
    "sampleType": "Urine",
    "urgency": "Routine",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Urine Routine normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Osteoarthritis Knee"
  },
  {
    "id": "LAB-2026-118",
    "orderId": "LAB-2026-118",
    "patientId": "P10089",
    "patientName": "Lakshmi Pillai",
    "doctorId": "D03",
    "doctorName": "Dr. Vikram Nair",
    "testName": "Culture & Sensitivity",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Acute Tonsillitis"
  },
  {
    "id": "LAB-2026-119",
    "orderId": "LAB-2026-119",
    "patientId": "P10092",
    "patientName": "Vikramaditya Roy",
    "doctorId": "D04",
    "doctorName": "Dr. Sanjay Dutt",
    "testName": "Troponin I",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Pending",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Troponin I normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for BPH – Benign Prostatic Hyperplasia"
  },
  {
    "id": "LAB-2026-120",
    "orderId": "LAB-2026-120",
    "patientId": "P10098",
    "patientName": "Geetha Krishnan",
    "doctorId": "D05",
    "doctorName": "Dr. Alok Verma",
    "testName": "D-Dimer",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Verified",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for COPD Exacerbation"
  },
  {
    "id": "LAB-2026-121",
    "orderId": "LAB-2026-121",
    "patientId": "P10102",
    "patientName": "Vikram Malhotra",
    "doctorId": "D01",
    "doctorName": "Dr. Suresh Bhat",
    "testName": "CBC",
    "sampleType": "Urine",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "CBC normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Right Femur Fracture"
  },
  {
    "id": "LAB-2026-122",
    "orderId": "LAB-2026-122",
    "patientId": "P10108",
    "patientName": "Sangeetha Reddi",
    "doctorId": "D02",
    "doctorName": "Dr. Rakesh Jhunjhun",
    "testName": "Blood Sugar",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Chronic Gastritis"
  },
  {
    "id": "LAB-2026-123",
    "orderId": "LAB-2026-123",
    "patientId": "P10115",
    "patientName": "Ananya Roy",
    "doctorId": "D03",
    "doctorName": "Dr. Priya Sharma",
    "testName": "Lipid Profile",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Lipid Profile normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Type 1 Diabetes"
  },
  {
    "id": "LAB-2026-124",
    "orderId": "LAB-2026-124",
    "patientId": "P10120",
    "patientName": "Harish Chandra",
    "doctorId": "D04",
    "doctorName": "Dr. Meera Nambiar",
    "testName": "Liver Function",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Pending",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Chronic Kidney Disease"
  },
  {
    "id": "LAB-2026-125",
    "orderId": "LAB-2026-125",
    "patientId": "P10128",
    "patientName": "Suresh Gupta",
    "doctorId": "D05",
    "doctorName": "Dr. Alok Verma",
    "testName": "Kidney Function",
    "sampleType": "Urine",
    "urgency": "Urgent",
    "status": "Verified",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Kidney Function normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Severe Bronchospasm"
  },
  {
    "id": "LAB-2026-126",
    "orderId": "LAB-2026-126",
    "patientId": "P10135",
    "patientName": "Divya Mukhopadhyay",
    "doctorId": "D01",
    "doctorName": "Dr. Shalini Das",
    "testName": "Thyroid Profile",
    "sampleType": "Blood",
    "urgency": "STAT",
    "status": "Completed",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Hyperthyroidism"
  },
  {
    "id": "LAB-2026-127",
    "orderId": "LAB-2026-127",
    "patientId": "P10140",
    "patientName": "Amitabh Saxena",
    "doctorId": "D02",
    "doctorName": "Dr. Siddharth Roy",
    "testName": "Urine Routine",
    "sampleType": "Blood",
    "urgency": "Routine",
    "status": "Processing",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": "2026-09-18T10:00:00",
    "verifiedAt": "2026-09-18T10:30:00",
    "result": {
      "value": "Normal",
      "report": "Urine Routine normal limits."
    },
    "department": "General Medicine",
    "notes": "Lab request for Chemotherapy Protocol"
  },
  {
    "id": "LAB-2026-128",
    "orderId": "LAB-2026-128",
    "patientId": "P10145",
    "patientName": "Rohit Shetty",
    "doctorId": "D03",
    "doctorName": "Dr. Arun Krishnan",
    "testName": "Culture & Sensitivity",
    "sampleType": "Blood",
    "urgency": "Urgent",
    "status": "Sample Collected",
    "orderedDate": "2026-09-18",
    "sampleCollectedAt": "2026-09-18T08:30:00",
    "resultEnteredAt": null,
    "verifiedAt": null,
    "result": null,
    "department": "General Medicine",
    "notes": "Lab request for Chronic Sinusitis"
  }
];

const getLocal = () => {
  try { const d = localStorage.getItem(STORE_KEY); if (d) { const parsed = JSON.parse(d); if (Array.isArray(parsed) && parsed.length >= 20) return parsed; } } catch { /* */ }
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED_ORDERS));
  return SEED_ORDERS;
};
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };

const headers = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const laboratoryService = {
  async getLabOrders(params = {}) {
    const { search = '', status = '', urgency = '', patientId = '', patientName = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, status, urgency, patientId, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/lab/orders?${q}`, { headers: headers() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { orders: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* fallback */ }

    let list = getLocal();
    
    if (patientId) {
      list = list.filter(o => o.patientId === patientId || (patientName && o.patientName?.toLowerCase() === patientName.toLowerCase()));
      if (list.length === 0) {
        const pName = patientName || `Patient (${patientId})`;
        const fallbackOrders = [
          { id: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '101'}`, orderId: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '101'}`, patientId: patientId, patientName: pName, doctorId: 'D001', doctorName: 'Dr. Priya Sharma', testName: 'Complete Blood Count (CBC) Panel', sampleType: 'Blood', urgency: 'Routine', status: 'Completed', orderedDate: today, sampleCollectedAt: today + 'T08:30:00', resultEnteredAt: today + 'T10:00:00', verifiedAt: today + 'T10:30:00', result: { value: 'Normal & Healthy', report: 'WBC: 7.2 k/µL (Normal), RBC: 4.8 M/µL, Hemoglobin: 13.8 g/dL, Platelets: 240,000/µL. All blood counts within safe parameters.' }, department: 'Pathology & Hematology', notes: 'Routine check' },
          { id: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '102'}`, orderId: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '102'}`, patientId: patientId, patientName: pName, doctorId: 'D001', doctorName: 'Dr. Priya Sharma', testName: 'Fasting Blood Glucose (Sugar)', sampleType: 'Blood', urgency: 'Routine', status: 'Completed', orderedDate: today, sampleCollectedAt: today + 'T08:45:00', resultEnteredAt: today + 'T10:15:00', verifiedAt: today + 'T10:45:00', result: { value: 'Controlled (105 mg/dL)', report: 'Fasting Blood Sugar: 105 mg/dL. Well controlled with morning meal advice.' }, department: 'Biochemistry', notes: 'Fasting sample' },
          { id: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '103'}`, orderId: `LAB-2026-${patientId.replace(/[^0-9]/g, '') || '103'}`, patientId: patientId, patientName: pName, doctorId: 'D002', doctorName: 'Dr. Kiran Rao', testName: 'Chest X-Ray Digital Scan', sampleType: 'Digital Image', urgency: 'Routine', status: 'Completed', orderedDate: today, sampleCollectedAt: today + 'T09:15:00', resultEnteredAt: today + 'T11:00:00', verifiedAt: today + 'T11:30:00', result: { value: 'Clear & Healthy Lungs', report: 'Bilateral lung fields clear. Heart size normal. No pleural effusion or active infiltrates.' }, department: 'Radiology', notes: 'Pre-discharge scan' }
        ];
        const allList = getLocal();
        fallbackOrders.forEach(o => allList.unshift(o));
        saveLocal(allList);
        list = fallbackOrders;
      }
    } else if (search.trim()) { 
      const q = search.toLowerCase(); 
      list = list.filter(o => o.patientName?.toLowerCase().includes(q) || o.testName?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q) || o.patientId?.toLowerCase().includes(q)); 
    }

    if (status && status !== 'All') list = list.filter(o => o.status === status);
    if (urgency && urgency !== 'All') list = list.filter(o => o.urgency === urgency);
    const total = list.length;
    return { orders: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async getLabOrderById(id) {
    try { const res = await fetch(`${API_BASE_URL}/lab/orders/${id}`, { headers: headers() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { order: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal();
    const order = list.find(o => o.id === id || o.orderId === id);
    return order ? { order, isLiveApi: false } : null;
  },

  async createLabOrder(data) {
    const list = getLocal();
    const id = `LAB-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, orderId: id, ...data, status: 'Pending', orderedDate: new Date().toISOString().split('T')[0], sampleCollectedAt: null, result: null };
    try {
      const res = await fetch(`${API_BASE_URL}/lab/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, order: record, isLiveApi: false };
  },

  async updateLabOrder(id, updates) {
    const list = getLocal();
    const idx = list.findIndex(o => o.id === id || o.orderId === id);
    if (idx === -1) throw new Error('Lab order not found');
    try {
      const res = await fetch(`${API_BASE_URL}/lab/orders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(updates) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, order: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list[idx] = { ...list[idx], ...updates };
    saveLocal(list);
    return { success: true, order: list[idx], isLiveApi: false };
  },

  async collectSample(id) {
    return this.updateLabOrder(id, { status: 'Sample Collected', sampleCollectedAt: new Date().toISOString() });
  },

  async enterResult(id, result) {
    return this.updateLabOrder(id, { status: 'Result Entered', result, resultEnteredAt: new Date().toISOString() });
  },

  async verifyResult(id) {
    return this.updateLabOrder(id, { status: 'Verified', verifiedAt: new Date().toISOString() });
  },

  async completeOrder(id) {
    return this.updateLabOrder(id, { status: 'Completed' });
  },

  async getPatientLabHistory(patientId) {
    try { const res = await fetch(`${API_BASE_URL}/lab/patient/${patientId}`, { headers: headers() }); if (res.ok) { const d = await res.json(); if (d.success) return { orders: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal();
    return { orders: list.filter(o => o.patientId === patientId), isLiveApi: false };
  },
};

export default laboratoryService;
