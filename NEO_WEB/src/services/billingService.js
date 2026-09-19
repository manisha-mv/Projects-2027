// services/billingService.js
// Billing & Finance — invoices, payments, receipts — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const INV_KEY = 'neo_hms_invoices_v1';
const PAY_KEY = 'neo_hms_payments_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Insurance', 'Cheque'];
export const INVOICE_STATUSES = ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

const SEED_INVOICES = [
  {
    "id": "INV-2026-101",
    "invoiceId": "INV-2026-101",
    "patientId": "P10025",
    "patientName": "Arun Kumar",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Priya Sharma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (General Ward × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 200,
        "total": 200
      }
    ],
    "subtotal": 1500,
    "tax": 0,
    "discount": 200,
    "total": 1300,
    "paid": 1300,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Essential Hypertension"
  },
  {
    "id": "INV-2026-102",
    "invoiceId": "INV-2026-102",
    "patientId": "P10041",
    "patientName": "Meena Devi",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Rekha Singh)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Maternity × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 200,
        "total": 200
      }
    ],
    "subtotal": 1950,
    "tax": 0,
    "discount": 0,
    "total": 1950,
    "paid": 975,
    "balance": 975,
    "status": "Partially Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Gestational Diabetes"
  },
  {
    "id": "INV-2026-103",
    "invoiceId": "INV-2026-103",
    "patientId": "P10067",
    "patientName": "Rajesh Nair",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Kiran Rao)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Cardiology ICU × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 400,
        "total": 400
      }
    ],
    "subtotal": 2400,
    "tax": 0,
    "discount": 0,
    "total": 2400,
    "paid": 2400,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Card",
    "notes": "Billing for AMI – Post-Stent"
  },
  {
    "id": "INV-2026-104",
    "invoiceId": "INV-2026-104",
    "patientId": "P10033",
    "patientName": "Sunita Iyer",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Kiran Rao)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Cardiology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 850,
        "total": 850
      }
    ],
    "subtotal": 2850,
    "tax": 0,
    "discount": 200,
    "total": 2650,
    "paid": 1325,
    "balance": 1325,
    "status": "Partially Paid",
    "paymentMethod": "Net Banking",
    "notes": "Billing for Coronary Artery Disease"
  },
  {
    "id": "INV-2026-105",
    "invoiceId": "INV-2026-105",
    "patientId": "P10047",
    "patientName": "Prakash Nair",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Ananya Menon)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Neurology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 1300,
        "total": 1300
      }
    ],
    "subtotal": 3300,
    "tax": 0,
    "discount": 0,
    "total": 3300,
    "paid": 3300,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Insurance",
    "notes": "Billing for Chronic Migraine"
  },
  {
    "id": "INV-2026-106",
    "invoiceId": "INV-2026-106",
    "patientId": "P10055",
    "patientName": "Fatima Begum",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Rekha Singh)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Maternity × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 1750,
        "total": 1750
      }
    ],
    "subtotal": 3750,
    "tax": 0,
    "discount": 0,
    "total": 3750,
    "paid": 1875,
    "balance": 1875,
    "status": "Partially Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Labour – Active"
  },
  {
    "id": "INV-2026-107",
    "invoiceId": "INV-2026-107",
    "patientId": "P10062",
    "patientName": "Rajesh Varma",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Suresh Bhat)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Orthopedics × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 2200,
        "total": 2200
      }
    ],
    "subtotal": 4200,
    "tax": 0,
    "discount": 200,
    "total": 4000,
    "paid": 4000,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Post Hip Replacement"
  },
  {
    "id": "INV-2026-108",
    "invoiceId": "INV-2026-108",
    "patientId": "P10069",
    "patientName": "Deepa Thomas",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Rahul Mehta)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Emergency × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 2650,
        "total": 2650
      }
    ],
    "subtotal": 4650,
    "tax": 0,
    "discount": 0,
    "total": 4650,
    "paid": 2325,
    "balance": 2325,
    "status": "Partially Paid",
    "paymentMethod": "Card",
    "notes": "Billing for Acute Appendicitis"
  },
  {
    "id": "INV-2026-109",
    "invoiceId": "INV-2026-109",
    "patientId": "P10011",
    "patientName": "Kavitha Rao",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Priya Sharma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (General Ward × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 3100,
        "total": 3100
      }
    ],
    "subtotal": 5100,
    "tax": 0,
    "discount": 0,
    "total": 5100,
    "paid": 5100,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Net Banking",
    "notes": "Billing for Hypothyroidism"
  },
  {
    "id": "INV-2026-110",
    "invoiceId": "INV-2026-110",
    "patientId": "P10052",
    "patientName": "Mohammed Aslam",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Priya Sharma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (General Ward × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 3550,
        "total": 3550
      }
    ],
    "subtotal": 5550,
    "tax": 0,
    "discount": 200,
    "total": 5350,
    "paid": 2675,
    "balance": 2675,
    "status": "Partially Paid",
    "paymentMethod": "Insurance",
    "notes": "Billing for Bronchial Asthma"
  },
  {
    "id": "INV-2026-111",
    "invoiceId": "INV-2026-111",
    "patientId": "P10018",
    "patientName": "Karthik Suresh",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Ananya Menon)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Neurology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 4000,
        "total": 4000
      }
    ],
    "subtotal": 6000,
    "tax": 0,
    "discount": 0,
    "total": 6000,
    "paid": 6000,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Seizure Disorder"
  },
  {
    "id": "INV-2026-112",
    "invoiceId": "INV-2026-112",
    "patientId": "P10031",
    "patientName": "Lalitha Iyer",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Kiran Rao)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Cardiology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 4450,
        "total": 4450
      }
    ],
    "subtotal": 6450,
    "tax": 0,
    "discount": 0,
    "total": 6450,
    "paid": 3225,
    "balance": 3225,
    "status": "Partially Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Hypertensive Heart Disease"
  },
  {
    "id": "INV-2026-113",
    "invoiceId": "INV-2026-113",
    "patientId": "P10060",
    "patientName": "Sunita Pillai",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Ananya Menon)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Neurology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 4900,
        "total": 4900
      }
    ],
    "subtotal": 6900,
    "tax": 0,
    "discount": 200,
    "total": 6700,
    "paid": 6700,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Card",
    "notes": "Billing for Cervical Spondylosis"
  },
  {
    "id": "INV-2026-114",
    "invoiceId": "INV-2026-114",
    "patientId": "P10071",
    "patientName": "Ravi Shankar",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Kiran Rao)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Cardiology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 5350,
        "total": 5350
      }
    ],
    "subtotal": 7350,
    "tax": 0,
    "discount": 0,
    "total": 7350,
    "paid": 3675,
    "balance": 3675,
    "status": "Partially Paid",
    "paymentMethod": "Net Banking",
    "notes": "Billing for Angina Pectoris"
  },
  {
    "id": "INV-2026-115",
    "invoiceId": "INV-2026-115",
    "patientId": "P10075",
    "patientName": "Anil Deshmukh",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Priya Sharma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (General Ward × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 5800,
        "total": 5800
      }
    ],
    "subtotal": 7800,
    "tax": 0,
    "discount": 0,
    "total": 7800,
    "paid": 7800,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Insurance",
    "notes": "Billing for Type 2 Diabetes Mellitus"
  },
  {
    "id": "INV-2026-116",
    "invoiceId": "INV-2026-116",
    "patientId": "P10080",
    "patientName": "Pooja Hegde",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Leena Joseph)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Dermatology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 6250,
        "total": 6250
      }
    ],
    "subtotal": 8250,
    "tax": 0,
    "discount": 200,
    "total": 8050,
    "paid": 4025,
    "balance": 4025,
    "status": "Partially Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Psoriasis Vulgaris"
  },
  {
    "id": "INV-2026-117",
    "invoiceId": "INV-2026-117",
    "patientId": "P10085",
    "patientName": "Suresh Menon",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Suresh Bhat)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Orthopedics × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 6700,
        "total": 6700
      }
    ],
    "subtotal": 8700,
    "tax": 0,
    "discount": 0,
    "total": 8700,
    "paid": 8700,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Osteoarthritis Knee"
  },
  {
    "id": "INV-2026-118",
    "invoiceId": "INV-2026-118",
    "patientId": "P10089",
    "patientName": "Lakshmi Pillai",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Vikram Nair)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Paediatrics × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 7150,
        "total": 7150
      }
    ],
    "subtotal": 9150,
    "tax": 0,
    "discount": 0,
    "total": 9150,
    "paid": 4575,
    "balance": 4575,
    "status": "Partially Paid",
    "paymentMethod": "Card",
    "notes": "Billing for Acute Tonsillitis"
  },
  {
    "id": "INV-2026-119",
    "invoiceId": "INV-2026-119",
    "patientId": "P10092",
    "patientName": "Vikramaditya Roy",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Sanjay Dutt)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Urology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 7600,
        "total": 7600
      }
    ],
    "subtotal": 9600,
    "tax": 0,
    "discount": 200,
    "total": 9400,
    "paid": 9400,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Net Banking",
    "notes": "Billing for BPH – Benign Prostatic Hyperplasia"
  },
  {
    "id": "INV-2026-120",
    "invoiceId": "INV-2026-120",
    "patientId": "P10098",
    "patientName": "Geetha Krishnan",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Alok Verma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Pulmonology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 8050,
        "total": 8050
      }
    ],
    "subtotal": 10050,
    "tax": 0,
    "discount": 0,
    "total": 10050,
    "paid": 5025,
    "balance": 5025,
    "status": "Partially Paid",
    "paymentMethod": "Insurance",
    "notes": "Billing for COPD Exacerbation"
  },
  {
    "id": "INV-2026-121",
    "invoiceId": "INV-2026-121",
    "patientId": "P10102",
    "patientName": "Vikram Malhotra",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Suresh Bhat)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Orthopedics × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 8500,
        "total": 8500
      }
    ],
    "subtotal": 10500,
    "tax": 0,
    "discount": 0,
    "total": 10500,
    "paid": 10500,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Right Femur Fracture"
  },
  {
    "id": "INV-2026-122",
    "invoiceId": "INV-2026-122",
    "patientId": "P10108",
    "patientName": "Sangeetha Reddi",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Rakesh Jhunjhun)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Gastroenterology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 8950,
        "total": 8950
      }
    ],
    "subtotal": 10950,
    "tax": 0,
    "discount": 200,
    "total": 10750,
    "paid": 5375,
    "balance": 5375,
    "status": "Partially Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Chronic Gastritis"
  },
  {
    "id": "INV-2026-123",
    "invoiceId": "INV-2026-123",
    "patientId": "P10115",
    "patientName": "Ananya Roy",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Priya Sharma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (General Ward × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 9400,
        "total": 9400
      }
    ],
    "subtotal": 11400,
    "tax": 0,
    "discount": 0,
    "total": 11400,
    "paid": 11400,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Card",
    "notes": "Billing for Type 1 Diabetes"
  },
  {
    "id": "INV-2026-124",
    "invoiceId": "INV-2026-124",
    "patientId": "P10120",
    "patientName": "Harish Chandra",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Meera Nambiar)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Nephrology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 9850,
        "total": 9850
      }
    ],
    "subtotal": 11850,
    "tax": 0,
    "discount": 0,
    "total": 11850,
    "paid": 5925,
    "balance": 5925,
    "status": "Partially Paid",
    "paymentMethod": "Net Banking",
    "notes": "Billing for Chronic Kidney Disease"
  },
  {
    "id": "INV-2026-125",
    "invoiceId": "INV-2026-125",
    "patientId": "P10128",
    "patientName": "Suresh Gupta",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Alok Verma)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Pulmonology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 10300,
        "total": 10300
      }
    ],
    "subtotal": 12300,
    "tax": 0,
    "discount": 200,
    "total": 12100,
    "paid": 12100,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "Insurance",
    "notes": "Billing for Severe Bronchospasm"
  },
  {
    "id": "INV-2026-126",
    "invoiceId": "INV-2026-126",
    "patientId": "P10135",
    "patientName": "Divya Mukhopadhyay",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Shalini Das)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Endocrinology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 10750,
        "total": 10750
      }
    ],
    "subtotal": 12750,
    "tax": 0,
    "discount": 0,
    "total": 12750,
    "paid": 6375,
    "balance": 6375,
    "status": "Partially Paid",
    "paymentMethod": "Cash",
    "notes": "Billing for Hyperthyroidism"
  },
  {
    "id": "INV-2026-127",
    "invoiceId": "INV-2026-127",
    "patientId": "P10140",
    "patientName": "Amitabh Saxena",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Siddharth Roy)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (Oncology × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 11200,
        "total": 11200
      }
    ],
    "subtotal": 13200,
    "tax": 0,
    "discount": 0,
    "total": 13200,
    "paid": 13200,
    "balance": 0,
    "status": "Paid",
    "paymentMethod": "UPI",
    "notes": "Billing for Chemotherapy Protocol"
  },
  {
    "id": "INV-2026-128",
    "invoiceId": "INV-2026-128",
    "patientId": "P10145",
    "patientName": "Rohit Shetty",
    "invoiceDate": "2026-09-18",
    "dueDate": "2026-09-18",
    "items": [
      {
        "description": "Consultation (Dr. Arun Krishnan)",
        "qty": 1,
        "rate": 800,
        "total": 800
      },
      {
        "description": "Room Charges (ENT × 2 days)",
        "qty": 2,
        "rate": 600,
        "total": 1200
      },
      {
        "description": "Diagnostics & Pharmacy",
        "qty": 1,
        "rate": 11650,
        "total": 11650
      }
    ],
    "subtotal": 13650,
    "tax": 0,
    "discount": 200,
    "total": 13450,
    "paid": 6725,
    "balance": 6725,
    "status": "Partially Paid",
    "paymentMethod": "Card",
    "notes": "Billing for Chronic Sinusitis"
  }
];

const getL = (key, seed) => { try { const d = localStorage.getItem(key); if (d) { const parsed = JSON.parse(d); if (Array.isArray(parsed) && parsed.length >= 20) return parsed; } } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveL = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const billingService = {
  async getInvoices(params = {}) {
    const { search = '', status = '', patientId = '', patientName = '', page = 1, limit = 20 } = params;
    try { 
      const q = new URLSearchParams({ search, status, patientId, page, limit }).toString(); 
      const res = await fetch(`${API_BASE_URL}/billing/invoices?${q}`, { headers: h() }); 
      if (res.ok) { 
        const d = await res.json(); 
        if (d.success && d.data) return { invoices: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; 
      } 
    } catch { /* */ }

    let list = getL(INV_KEY, SEED_INVOICES);
    
    if (patientId) {
      list = list.filter(i => i.patientId === patientId || (patientName && i.patientName?.toLowerCase() === patientName.toLowerCase()));
      // If no invoice exists for this logged-in patient, generate a personalized fallback invoice for them
      if (list.length === 0) {
        const pName = patientName || `Patient (${patientId})`;
        const newInvoice = {
          id: `INV-2026-${patientId.replace(/[^0-9]/g, '') || '999'}`,
          invoiceId: `INV-2026-${patientId.replace(/[^0-9]/g, '') || '999'}`,
          patientId: patientId,
          patientName: pName,
          invoiceDate: today,
          dueDate: today,
          items: [
            { description: 'Specialist Consultation Fee (Dr. Priya Sharma)', qty: 1, rate: 800, total: 800 },
            { description: 'Inpatient Room & Care Charges (Ward GW-04 × 2 days)', qty: 2, rate: 1200, total: 2400 },
            { description: 'Pathology & Diagnostic Blood Panel', qty: 1, rate: 750, total: 750 },
            { description: 'Prescription Pharmacy & Daily Tablets', qty: 1, rate: 450, total: 450 }
          ],
          subtotal: 4400,
          tax: 0,
          discount: 400,
          total: 4000,
          paid: 3000,
          balance: 1000,
          status: 'Partially Paid',
          paymentMethod: 'UPI',
          notes: 'Personal Patient Portal Invoice'
        };
        const allList = getL(INV_KEY, SEED_INVOICES);
        allList.unshift(newInvoice);
        saveL(INV_KEY, allList);
        list = [newInvoice];
      }
    } else if (search.trim()) { 
      const q = search.toLowerCase(); 
      list = list.filter(i => i.patientName?.toLowerCase().includes(q) || i.invoiceId?.toLowerCase().includes(q) || i.patientId?.toLowerCase().includes(q)); 
    }

    if (status && status !== 'All') list = list.filter(i => i.status === status);
    return { invoices: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async getInvoiceById(id) {
    try { const res = await fetch(`${API_BASE_URL}/billing/invoices/${id}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { invoice: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getL(INV_KEY, SEED_INVOICES);
    const inv = list.find(i => i.id === id || i.invoiceId === id);
    return inv ? { invoice: inv, isLiveApi: false } : null;
  },

  async createInvoice(data) {
    const list = getL(INV_KEY, SEED_INVOICES);
    const id = `INV-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const subtotal = data.items?.reduce((s, i) => s + (i.total || 0), 0) || 0;
    const total = subtotal - (data.discount || 0) + (data.tax || 0);
    const record = { id, invoiceId: id, ...data, subtotal, total, paid: 0, balance: total, status: 'Issued', invoiceDate: new Date().toISOString().split('T')[0] };
    try { const res = await fetch(`${API_BASE_URL}/billing/invoices`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveL(INV_KEY, list); return { success: true, invoice: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveL(INV_KEY, list);
    return { success: true, invoice: record, isLiveApi: false };
  },

  async processPayment(invoiceId, amount, method) {
    const list = getL(INV_KEY, SEED_INVOICES);
    const idx = list.findIndex(i => i.id === invoiceId || i.invoiceId === invoiceId);
    if (idx === -1) throw new Error('Invoice not found');
    const newPaid = list[idx].paid + amount;
    const newBalance = Math.max(0, list[idx].total - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';
    try { const res = await fetch(`${API_BASE_URL}/billing/payments`, { method: 'POST', headers: h(), body: JSON.stringify({ invoiceId, amount, method }) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = { ...list[idx], paid: newPaid, balance: newBalance, status: newStatus, paymentMethod: method }; saveL(INV_KEY, list); return { success: true, invoice: list[idx], isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], paid: newPaid, balance: newBalance, status: newStatus, paymentMethod: method };
    saveL(INV_KEY, list);
    return { success: true, invoice: list[idx], isLiveApi: false };
  },

  getDashboardStats() {
    const list = getL(INV_KEY, SEED_INVOICES);
    return {
      totalRevenue: list.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
      pendingAmount: list.filter(i => ['Issued', 'Partially Paid', 'Overdue'].includes(i.status)).reduce((s, i) => s + i.balance, 0),
      totalInvoices: list.length,
      paidInvoices: list.filter(i => i.status === 'Paid').length,
    };
  },
};

export default billingService;
