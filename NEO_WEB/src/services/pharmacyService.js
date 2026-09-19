// services/pharmacyService.js
// Pharmacy — prescriptions & dispensing — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const PRES_KEY = 'neo_hms_pharmacy_prescriptions_v1';
const HIST_KEY = 'neo_hms_pharmacy_history_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const PRESCRIPTION_STATUSES = ['Pending', 'Partially Dispensed', 'Dispensed', 'Cancelled'];

const SEED_PRESCRIPTIONS = [
  {
    "id": "RX-2026-101",
    "prescriptionId": "RX-2026-101",
    "patientId": "P10025",
    "patientName": "Arun Kumar",
    "doctorId": "D01",
    "doctorName": "Dr. Priya Sharma",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Essential Hypertension",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-102",
    "prescriptionId": "RX-2026-102",
    "patientId": "P10041",
    "patientName": "Meena Devi",
    "doctorId": "D02",
    "doctorName": "Dr. Rekha Singh",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Gestational Diabetes",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-103",
    "prescriptionId": "RX-2026-103",
    "patientId": "P10067",
    "patientName": "Rajesh Nair",
    "doctorId": "D03",
    "doctorName": "Dr. Kiran Rao",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for AMI – Post-Stent",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-104",
    "prescriptionId": "RX-2026-104",
    "patientId": "P10033",
    "patientName": "Sunita Iyer",
    "doctorId": "D04",
    "doctorName": "Dr. Kiran Rao",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Coronary Artery Disease",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-105",
    "prescriptionId": "RX-2026-105",
    "patientId": "P10047",
    "patientName": "Prakash Nair",
    "doctorId": "D05",
    "doctorName": "Dr. Ananya Menon",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Chronic Migraine",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-106",
    "prescriptionId": "RX-2026-106",
    "patientId": "P10055",
    "patientName": "Fatima Begum",
    "doctorId": "D01",
    "doctorName": "Dr. Rekha Singh",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Labour – Active",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-107",
    "prescriptionId": "RX-2026-107",
    "patientId": "P10062",
    "patientName": "Rajesh Varma",
    "doctorId": "D02",
    "doctorName": "Dr. Suresh Bhat",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Post Hip Replacement",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-108",
    "prescriptionId": "RX-2026-108",
    "patientId": "P10069",
    "patientName": "Deepa Thomas",
    "doctorId": "D03",
    "doctorName": "Dr. Rahul Mehta",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Acute Appendicitis",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-109",
    "prescriptionId": "RX-2026-109",
    "patientId": "P10011",
    "patientName": "Kavitha Rao",
    "doctorId": "D04",
    "doctorName": "Dr. Priya Sharma",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Hypothyroidism",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-110",
    "prescriptionId": "RX-2026-110",
    "patientId": "P10052",
    "patientName": "Mohammed Aslam",
    "doctorId": "D05",
    "doctorName": "Dr. Priya Sharma",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Bronchial Asthma",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-111",
    "prescriptionId": "RX-2026-111",
    "patientId": "P10018",
    "patientName": "Karthik Suresh",
    "doctorId": "D01",
    "doctorName": "Dr. Ananya Menon",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Seizure Disorder",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-112",
    "prescriptionId": "RX-2026-112",
    "patientId": "P10031",
    "patientName": "Lalitha Iyer",
    "doctorId": "D02",
    "doctorName": "Dr. Kiran Rao",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Hypertensive Heart Disease",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-113",
    "prescriptionId": "RX-2026-113",
    "patientId": "P10060",
    "patientName": "Sunita Pillai",
    "doctorId": "D03",
    "doctorName": "Dr. Ananya Menon",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Cervical Spondylosis",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-114",
    "prescriptionId": "RX-2026-114",
    "patientId": "P10071",
    "patientName": "Ravi Shankar",
    "doctorId": "D04",
    "doctorName": "Dr. Kiran Rao",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Angina Pectoris",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-115",
    "prescriptionId": "RX-2026-115",
    "patientId": "P10075",
    "patientName": "Anil Deshmukh",
    "doctorId": "D05",
    "doctorName": "Dr. Priya Sharma",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Type 2 Diabetes Mellitus",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-116",
    "prescriptionId": "RX-2026-116",
    "patientId": "P10080",
    "patientName": "Pooja Hegde",
    "doctorId": "D01",
    "doctorName": "Dr. Leena Joseph",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Psoriasis Vulgaris",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-117",
    "prescriptionId": "RX-2026-117",
    "patientId": "P10085",
    "patientName": "Suresh Menon",
    "doctorId": "D02",
    "doctorName": "Dr. Suresh Bhat",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Osteoarthritis Knee",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-118",
    "prescriptionId": "RX-2026-118",
    "patientId": "P10089",
    "patientName": "Lakshmi Pillai",
    "doctorId": "D03",
    "doctorName": "Dr. Vikram Nair",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Acute Tonsillitis",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-119",
    "prescriptionId": "RX-2026-119",
    "patientId": "P10092",
    "patientName": "Vikramaditya Roy",
    "doctorId": "D04",
    "doctorName": "Dr. Sanjay Dutt",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for BPH – Benign Prostatic Hyperplasia",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-120",
    "prescriptionId": "RX-2026-120",
    "patientId": "P10098",
    "patientName": "Geetha Krishnan",
    "doctorId": "D05",
    "doctorName": "Dr. Alok Verma",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for COPD Exacerbation",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-121",
    "prescriptionId": "RX-2026-121",
    "patientId": "P10102",
    "patientName": "Vikram Malhotra",
    "doctorId": "D01",
    "doctorName": "Dr. Suresh Bhat",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Right Femur Fracture",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-122",
    "prescriptionId": "RX-2026-122",
    "patientId": "P10108",
    "patientName": "Sangeetha Reddi",
    "doctorId": "D02",
    "doctorName": "Dr. Rakesh Jhunjhun",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Chronic Gastritis",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-123",
    "prescriptionId": "RX-2026-123",
    "patientId": "P10115",
    "patientName": "Ananya Roy",
    "doctorId": "D03",
    "doctorName": "Dr. Priya Sharma",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Type 1 Diabetes",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-124",
    "prescriptionId": "RX-2026-124",
    "patientId": "P10120",
    "patientName": "Harish Chandra",
    "doctorId": "D04",
    "doctorName": "Dr. Meera Nambiar",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Chronic Kidney Disease",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-125",
    "prescriptionId": "RX-2026-125",
    "patientId": "P10128",
    "patientName": "Suresh Gupta",
    "doctorId": "D05",
    "doctorName": "Dr. Alok Verma",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Severe Bronchospasm",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-126",
    "prescriptionId": "RX-2026-126",
    "patientId": "P10135",
    "patientName": "Divya Mukhopadhyay",
    "doctorId": "D01",
    "doctorName": "Dr. Shalini Das",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Hyperthyroidism",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-127",
    "prescriptionId": "RX-2026-127",
    "patientId": "P10140",
    "patientName": "Amitabh Saxena",
    "doctorId": "D02",
    "doctorName": "Dr. Siddharth Roy",
    "prescribedDate": "2026-09-18",
    "status": "Dispensed",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 30
      }
    ],
    "notes": "Rx for Chemotherapy Protocol",
    "dispensedAt": "2026-09-18",
    "dispensedBy": "Pharmacy Main Team"
  },
  {
    "id": "RX-2026-128",
    "prescriptionId": "RX-2026-128",
    "patientId": "P10145",
    "patientName": "Rohit Shetty",
    "doctorId": "D03",
    "doctorName": "Dr. Arun Krishnan",
    "prescribedDate": "2026-09-18",
    "status": "Pending",
    "medicines": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "40mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "quantity": 30,
        "dispensed": 0
      }
    ],
    "notes": "Rx for Chronic Sinusitis",
    "dispensedAt": null,
    "dispensedBy": "Pharmacy Main Team"
  }
];

const getLocal = (key, seed) => { try { const d = localStorage.getItem(key); if (d) { const parsed = JSON.parse(d); if (Array.isArray(parsed) && parsed.length >= 20) return parsed; } } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveLocal = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const pharmacyService = {
  async getPrescriptions(params = {}) {
    const { search = '', status = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, status, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { prescriptions: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.patientName?.toLowerCase().includes(q) || p.prescriptionId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(p => p.status === status);
    const total = list.length;
    return { prescriptions: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async getPrescriptionById(id) {
    try { const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions/${id}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { prescription: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    const p = list.find(x => x.id === id || x.prescriptionId === id);
    return p ? { prescription: p, isLiveApi: false } : null;
  },

  async dispenseMedicine(prescriptionId, dispensedMeds) {
    const list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS);
    const idx = list.findIndex(p => p.id === prescriptionId || p.prescriptionId === prescriptionId);
    if (idx === -1) throw new Error('Prescription not found');
    try {
      const res = await fetch(`${API_BASE_URL}/pharmacy/prescriptions/${prescriptionId}/dispense`, { method: 'POST', headers: h(), body: JSON.stringify({ medicines: dispensedMeds }) });
      if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = d.data; saveLocal(PRES_KEY, list); return { success: true, prescription: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    const allFull = dispensedMeds.every(m => m.dispensed >= m.quantity);
    list[idx] = { ...list[idx], medicines: dispensedMeds, status: allFull ? 'Dispensed' : 'Partially Dispensed', dispensedAt: new Date().toISOString(), dispensedBy: 'Pharmacy Team' };
    saveLocal(PRES_KEY, list);
    return { success: true, prescription: list[idx], isLiveApi: false };
  },

  async getHistory(params = {}) {
    const { patientId = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ patientId, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/pharmacy/history?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { history: d.data, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal(PRES_KEY, SEED_PRESCRIPTIONS).filter(p => p.status === 'Dispensed');
    if (patientId) list = list.filter(p => p.patientId === patientId);
    return { history: list, isLiveApi: false };
  },
};

export default pharmacyService;
