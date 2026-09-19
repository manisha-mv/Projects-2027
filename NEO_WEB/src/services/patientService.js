// services/patientService.js
// Patient Management API Client with persistent LocalStorage fallback

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_STORAGE_KEY = 'neo_hms_patients_v1';

// Initial realistic dataset for NEO-HMS Smart Hospital
const INITIAL_PATIENTS = [
  {
    "id": "P10025",
    "patientId": "P10025",
    "firstName": "Arun",
    "lastName": "Kumar",
    "name": "Arun Kumar",
    "dateOfBirth": "1984-05-14",
    "age": 42,
    "gender": "Male",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 98450 12345",
      "email": "arun.kumar@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98450 12345"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Essential Hypertension",
        "since": "2022",
        "notes": "Managed by Dr. Priya Sharma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in General Ward (GW-04). Diagnosis: Essential Hypertension"
  },
  {
    "id": "P10041",
    "patientId": "P10041",
    "firstName": "Meena",
    "lastName": "Devi",
    "name": "Meena Devi",
    "dateOfBirth": "1991-11-20",
    "age": 35,
    "gender": "Female",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 97112 88341",
      "email": "meena.devi@outlook.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 97112 88341"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Gestational Diabetes",
        "since": "2022",
        "notes": "Managed by Dr. Rekha Singh"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Maternity (MAT-03). Diagnosis: Gestational Diabetes"
  },
  {
    "id": "P10067",
    "patientId": "P10067",
    "firstName": "Rajesh",
    "lastName": "Nair",
    "name": "Rajesh Nair",
    "dateOfBirth": "1968-03-08",
    "age": 58,
    "gender": "Male",
    "bloodGroup": "A+",
    "contact": {
      "phone": "+91 94471 44520",
      "email": "rnair68@yahoo.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 94471 44520"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "AMI – Post-Stent",
        "since": "2022",
        "notes": "Managed by Dr. Kiran Rao"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Cardiology ICU (ICU-02). Diagnosis: AMI – Post-Stent"
  },
  {
    "id": "P10033",
    "patientId": "P10033",
    "firstName": "Sunita",
    "lastName": "Iyer",
    "name": "Sunita Iyer",
    "dateOfBirth": "1976-08-25",
    "age": 50,
    "gender": "Female",
    "bloodGroup": "AB+",
    "contact": {
      "phone": "+91 98860 11223",
      "email": "sunita.iyer@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98860 11223"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Coronary Artery Disease",
        "since": "2022",
        "notes": "Managed by Dr. Kiran Rao"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Cardiology (CAR-02). Diagnosis: Coronary Artery Disease"
  },
  {
    "id": "P10047",
    "patientId": "P10047",
    "firstName": "Prakash",
    "lastName": "Nair",
    "name": "Prakash Nair",
    "dateOfBirth": "1972-02-14",
    "age": 54,
    "gender": "Male",
    "bloodGroup": "O-",
    "contact": {
      "phone": "+91 98860 77123",
      "email": "pnair@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98860 77123"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Chronic Migraine",
        "since": "2022",
        "notes": "Managed by Dr. Ananya Menon"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Neurology (NEU-07). Diagnosis: Chronic Migraine"
  },
  {
    "id": "P10055",
    "patientId": "P10055",
    "firstName": "Fatima",
    "lastName": "Begum",
    "name": "Fatima Begum",
    "dateOfBirth": "1997-04-18",
    "age": 29,
    "gender": "Female",
    "bloodGroup": "B-",
    "contact": {
      "phone": "+91 91672 99001",
      "email": "fatima.b@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 91672 99001"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Labour – Active",
        "since": "2022",
        "notes": "Managed by Dr. Rekha Singh"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Maternity (MAT-01). Diagnosis: Labour – Active"
  },
  {
    "id": "P10062",
    "patientId": "P10062",
    "firstName": "Rajesh",
    "lastName": "Varma",
    "name": "Rajesh Varma",
    "dateOfBirth": "1962-09-05",
    "age": 64,
    "gender": "Male",
    "bloodGroup": "A-",
    "contact": {
      "phone": "+91 98230 44512",
      "email": "r.varma@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98230 44512"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Post Hip Replacement",
        "since": "2022",
        "notes": "Managed by Dr. Suresh Bhat"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Orthopedics (ORT-11). Diagnosis: Post Hip Replacement"
  },
  {
    "id": "P10069",
    "patientId": "P10069",
    "firstName": "Deepa",
    "lastName": "Thomas",
    "name": "Deepa Thomas",
    "dateOfBirth": "1995-07-12",
    "age": 31,
    "gender": "Female",
    "bloodGroup": "AB-",
    "contact": {
      "phone": "+91 97400 11223",
      "email": "deepa.thomas@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 97400 11223"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Acute Appendicitis",
        "since": "2022",
        "notes": "Managed by Dr. Rahul Mehta"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Emergency (E-07). Diagnosis: Acute Appendicitis"
  },
  {
    "id": "P10011",
    "patientId": "P10011",
    "firstName": "Kavitha",
    "lastName": "Rao",
    "name": "Kavitha Rao",
    "dateOfBirth": "1982-01-30",
    "age": 44,
    "gender": "Female",
    "bloodGroup": "A-",
    "contact": {
      "phone": "+91 99001 22884",
      "email": "kavitha.rao@techindia.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 99001 22884"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Hypothyroidism",
        "since": "2022",
        "notes": "Managed by Dr. Priya Sharma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Discharged",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in General Ward (GW-02). Diagnosis: Hypothyroidism"
  },
  {
    "id": "P10052",
    "patientId": "P10052",
    "firstName": "Mohammed",
    "lastName": "Aslam",
    "name": "Mohammed Aslam",
    "dateOfBirth": "1980-03-12",
    "age": 46,
    "gender": "Male",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 91672 33410",
      "email": "m.aslam@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 91672 33410"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Bronchial Asthma",
        "since": "2022",
        "notes": "Managed by Dr. Priya Sharma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in General Ward (GW-05). Diagnosis: Bronchial Asthma"
  },
  {
    "id": "P10018",
    "patientId": "P10018",
    "firstName": "Karthik",
    "lastName": "Suresh",
    "name": "Karthik Suresh",
    "dateOfBirth": "1988-10-09",
    "age": 38,
    "gender": "Male",
    "bloodGroup": "A+",
    "contact": {
      "phone": "+91 98190 77654",
      "email": "ksuresh@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98190 77654"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Seizure Disorder",
        "since": "2022",
        "notes": "Managed by Dr. Ananya Menon"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Neurology (NEU-03). Diagnosis: Seizure Disorder"
  },
  {
    "id": "P10031",
    "patientId": "P10031",
    "firstName": "Lalitha",
    "lastName": "Iyer",
    "name": "Lalitha Iyer",
    "dateOfBirth": "1959-12-01",
    "age": 67,
    "gender": "Female",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 94480 33211",
      "email": "liyer@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 94480 33211"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Hypertensive Heart Disease",
        "since": "2022",
        "notes": "Managed by Dr. Kiran Rao"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Cardiology (CAR-05). Diagnosis: Hypertensive Heart Disease"
  },
  {
    "id": "P10060",
    "patientId": "P10060",
    "firstName": "Sunita",
    "lastName": "Pillai",
    "name": "Sunita Pillai",
    "dateOfBirth": "1986-06-22",
    "age": 40,
    "gender": "Female",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 97411 88223",
      "email": "spillai@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 97411 88223"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Cervical Spondylosis",
        "since": "2022",
        "notes": "Managed by Dr. Ananya Menon"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Neurology (NEU-01). Diagnosis: Cervical Spondylosis"
  },
  {
    "id": "P10071",
    "patientId": "P10071",
    "firstName": "Ravi",
    "lastName": "Shankar",
    "name": "Ravi Shankar",
    "dateOfBirth": "1971-04-14",
    "age": 55,
    "gender": "Male",
    "bloodGroup": "O-",
    "contact": {
      "phone": "+91 98200 11998",
      "email": "rshankar@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98200 11998"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Angina Pectoris",
        "since": "2022",
        "notes": "Managed by Dr. Kiran Rao"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Cardiology (CAR-08). Diagnosis: Angina Pectoris"
  },
  {
    "id": "P10075",
    "patientId": "P10075",
    "firstName": "Anil",
    "lastName": "Deshmukh",
    "name": "Anil Deshmukh",
    "dateOfBirth": "1976-08-11",
    "age": 50,
    "gender": "Male",
    "bloodGroup": "A+",
    "contact": {
      "phone": "+91 98210 55443",
      "email": "anild@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98210 55443"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Type 2 Diabetes Mellitus",
        "since": "2022",
        "notes": "Managed by Dr. Priya Sharma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in General Ward (GW-10). Diagnosis: Type 2 Diabetes Mellitus"
  },
  {
    "id": "P10080",
    "patientId": "P10080",
    "firstName": "Pooja",
    "lastName": "Hegde",
    "name": "Pooja Hegde",
    "dateOfBirth": "1999-01-15",
    "age": 27,
    "gender": "Female",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 97654 32109",
      "email": "phegde@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 97654 32109"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Psoriasis Vulgaris",
        "since": "2022",
        "notes": "Managed by Dr. Leena Joseph"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Dermatology (DER-02). Diagnosis: Psoriasis Vulgaris"
  },
  {
    "id": "P10085",
    "patientId": "P10085",
    "firstName": "Suresh",
    "lastName": "Menon",
    "name": "Suresh Menon",
    "dateOfBirth": "1965-07-28",
    "age": 61,
    "gender": "Male",
    "bloodGroup": "AB+",
    "contact": {
      "phone": "+91 94470 12345",
      "email": "smenon@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 94470 12345"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Osteoarthritis Knee",
        "since": "2022",
        "notes": "Managed by Dr. Suresh Bhat"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Orthopedics (ORT-04). Diagnosis: Osteoarthritis Knee"
  },
  {
    "id": "P10089",
    "patientId": "P10089",
    "firstName": "Lakshmi",
    "lastName": "Pillai",
    "name": "Lakshmi Pillai",
    "dateOfBirth": "2020-05-19",
    "age": 6,
    "gender": "Female",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 98450 66778",
      "email": "parent.pillai@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98450 66778"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Acute Tonsillitis",
        "since": "2022",
        "notes": "Managed by Dr. Vikram Nair"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Paediatrics (PW-02). Diagnosis: Acute Tonsillitis"
  },
  {
    "id": "P10092",
    "patientId": "P10092",
    "firstName": "Vikramaditya",
    "lastName": "Roy",
    "name": "Vikramaditya Roy",
    "dateOfBirth": "1955-11-03",
    "age": 71,
    "gender": "Male",
    "bloodGroup": "B-",
    "contact": {
      "phone": "+91 98300 44332",
      "email": "vroy@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98300 44332"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "BPH – Benign Prostatic Hyperplasia",
        "since": "2022",
        "notes": "Managed by Dr. Sanjay Dutt"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Urology (URO-01). Diagnosis: BPH – Benign Prostatic Hyperplasia"
  },
  {
    "id": "P10098",
    "patientId": "P10098",
    "firstName": "Geetha",
    "lastName": "Krishnan",
    "name": "Geetha Krishnan",
    "dateOfBirth": "1972-09-17",
    "age": 54,
    "gender": "Female",
    "bloodGroup": "A+",
    "contact": {
      "phone": "+91 94460 77889",
      "email": "gkrishnan@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 94460 77889"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "COPD Exacerbation",
        "since": "2022",
        "notes": "Managed by Dr. Alok Verma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Pulmonology (PUL-02). Diagnosis: COPD Exacerbation"
  },
  {
    "id": "P10102",
    "patientId": "P10102",
    "firstName": "Vikram",
    "lastName": "Malhotra",
    "name": "Vikram Malhotra",
    "dateOfBirth": "1993-02-24",
    "age": 33,
    "gender": "Male",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 98110 99887",
      "email": "vmalhotra@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98110 99887"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Right Femur Fracture",
        "since": "2022",
        "notes": "Managed by Dr. Suresh Bhat"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Orthopedics (ORT-05). Diagnosis: Right Femur Fracture"
  },
  {
    "id": "P10108",
    "patientId": "P10108",
    "firstName": "Sangeetha",
    "lastName": "Reddi",
    "name": "Sangeetha Reddi",
    "dateOfBirth": "1981-04-30",
    "age": 45,
    "gender": "Female",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 98480 11223",
      "email": "sreddi@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98480 11223"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Chronic Gastritis",
        "since": "2022",
        "notes": "Managed by Dr. Rakesh Jhunjhun"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Gastroenterology (GAS-03). Diagnosis: Chronic Gastritis"
  },
  {
    "id": "P10115",
    "patientId": "P10115",
    "firstName": "Ananya",
    "lastName": "Roy",
    "name": "Ananya Roy",
    "dateOfBirth": "2002-12-10",
    "age": 24,
    "gender": "Female",
    "bloodGroup": "A-",
    "contact": {
      "phone": "+91 98310 22334",
      "email": "aroy@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98310 22334"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Type 1 Diabetes",
        "since": "2022",
        "notes": "Managed by Dr. Priya Sharma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in General Ward (GW-12). Diagnosis: Type 1 Diabetes"
  },
  {
    "id": "P10120",
    "patientId": "P10120",
    "firstName": "Harish",
    "lastName": "Chandra",
    "name": "Harish Chandra",
    "dateOfBirth": "1960-01-20",
    "age": 66,
    "gender": "Male",
    "bloodGroup": "AB-",
    "contact": {
      "phone": "+91 94150 33445",
      "email": "hchandra@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 94150 33445"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Chronic Kidney Disease",
        "since": "2022",
        "notes": "Managed by Dr. Meera Nambiar"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Nephrology (NEP-01). Diagnosis: Chronic Kidney Disease"
  },
  {
    "id": "P10128",
    "patientId": "P10128",
    "firstName": "Suresh",
    "lastName": "Gupta",
    "name": "Suresh Gupta",
    "dateOfBirth": "1967-08-14",
    "age": 59,
    "gender": "Male",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 98100 55667",
      "email": "sgupta@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98100 55667"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Severe Bronchospasm",
        "since": "2022",
        "notes": "Managed by Dr. Alok Verma"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Pulmonology (PUL-04). Diagnosis: Severe Bronchospasm"
  },
  {
    "id": "P10135",
    "patientId": "P10135",
    "firstName": "Divya",
    "lastName": "Mukhopadhyay",
    "name": "Divya Mukhopadhyay",
    "dateOfBirth": "1989-06-05",
    "age": 37,
    "gender": "Female",
    "bloodGroup": "B+",
    "contact": {
      "phone": "+91 98301 66778",
      "email": "divyam@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98301 66778"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Hyperthyroidism",
        "since": "2022",
        "notes": "Managed by Dr. Shalini Das"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Endocrinology (END-01). Diagnosis: Hyperthyroidism"
  },
  {
    "id": "P10140",
    "patientId": "P10140",
    "firstName": "Amitabh",
    "lastName": "Saxena",
    "name": "Amitabh Saxena",
    "dateOfBirth": "1966-03-29",
    "age": 60,
    "gender": "Male",
    "bloodGroup": "A+",
    "contact": {
      "phone": "+91 98102 77889",
      "email": "asaxena@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98102 77889"
    },
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction": "Rash",
        "severity": "Mild"
      }
    ],
    "medicalHistory": [
      {
        "condition": "Chemotherapy Protocol",
        "since": "2022",
        "notes": "Managed by Dr. Siddharth Roy"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Inpatient",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in Oncology (ONC-02). Diagnosis: Chemotherapy Protocol"
  },
  {
    "id": "P10145",
    "patientId": "P10145",
    "firstName": "Rohit",
    "lastName": "Shetty",
    "name": "Rohit Shetty",
    "dateOfBirth": "1985-10-14",
    "age": 41,
    "gender": "Male",
    "bloodGroup": "O+",
    "contact": {
      "phone": "+91 98201 88990",
      "email": "rshetty@gmail.com",
      "address": {
        "street": "Main Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India"
      }
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "relation": "Family",
      "phone": "+91 98201 88990"
    },
    "allergies": [],
    "medicalHistory": [
      {
        "condition": "Chronic Sinusitis",
        "since": "2022",
        "notes": "Managed by Dr. Arun Krishnan"
      }
    ],
    "lastVisit": "2026-08-15",
    "status": "Active",
    "registeredDate": "2025-01-10",
    "notes": "Admitted in ENT (ENT-01). Diagnosis: Chronic Sinusitis"
  }
];

// Helper to calculate age from DOB
export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

// Initialize LocalStorage store if needed
const getLocalPatients = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse local patient store', err);
  }
  // Set initial store
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
  return INITIAL_PATIENTS;
};

const saveLocalPatients = (patients) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Failed to save patients to LocalStorage', err);
  }
};

// Auto-generate next Patient ID
export const generateNextPatientId = () => {
  const patients = getLocalPatients();
  let maxSeq = 10075;
  patients.forEach(p => {
    const match = p.patientId?.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  return `P${maxSeq + 1}`;
};

/**
 * Service API Methods
 */
export const patientService = {
  // GET Patients list with search, filter, and pagination
  async getPatients(params = {}) {
    const {
      search = '',
      gender = '',
      bloodGroup = '',
      status = '',
      page = 1,
      limit = 10,
    } = params;

    // Attempt real backend API if available
    try {
      const queryParts = [];
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
      if (gender) queryParts.push(`gender=${encodeURIComponent(gender)}`);
      if (bloodGroup) queryParts.push(`bloodGroup=${encodeURIComponent(bloodGroup)}`);
      if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
      queryParts.push(`page=${page}`);
      queryParts.push(`limit=${limit}`);

      const queryString = queryParts.join('&');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/patients?${queryString}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          return {
            patients: resData.data,
            total: resData.pagination?.total || resData.data.length,
            page: resData.pagination?.page || page,
            pages: resData.pagination?.pages || Math.ceil((resData.pagination?.total || resData.data.length) / limit),
            isLiveApi: true,
          };
        }
      }
    } catch {
      // Backend unavailable; fallback seamlessly to LocalStorage
    }

    // Local / Offline dataset fallback logic
    let list = getLocalPatients();

    // 1. Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => (
        (p.patientId && p.patientId.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.firstName && p.firstName.toLowerCase().includes(q)) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.contact?.phone && p.contact.phone.toLowerCase().includes(q))
      ));
    }

    // 2. Gender filter
    if (gender && gender !== 'All') {
      list = list.filter(p => p.gender?.toLowerCase() === gender.toLowerCase());
    }

    // 3. Blood group filter
    if (bloodGroup && bloodGroup !== 'All') {
      list = list.filter(p => p.bloodGroup === bloodGroup);
    }

    // 4. Status filter
    if (status && status !== 'All') {
      list = list.filter(p => p.status?.toLowerCase() === status.toLowerCase());
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedPatients = list.slice(startIndex, startIndex + limit);

    return {
      patients: paginatedPatients,
      total,
      page: safePage,
      pages: totalPages,
      isLiveApi: false,
    };
  },

  // GET Single Patient by ID
  async getPatientById(id) {
    if (!id) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          return { patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Fallback
    }

    const list = getLocalPatients();
    const patient = list.find(p => p.id === id || p.patientId === id);
    if (!patient) return null;

    return { patient, isLiveApi: false };
  },

  // POST Create New Patient
  async createPatient(patientData) {
    const newId = generateNextPatientId();
    const fullName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || patientData.name;
    const computedAge = calculateAge(patientData.dateOfBirth) ?? patientData.age ?? 0;

    const newPatientRecord = {
      id: newId,
      patientId: newId,
      firstName: patientData.firstName || fullName.split(' ')[0] || 'Patient',
      lastName: patientData.lastName || fullName.split(' ').slice(1).join(' ') || '',
      name: fullName,
      dateOfBirth: patientData.dateOfBirth,
      age: computedAge,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup || 'Unknown',
      contact: {
        phone: patientData.phone || patientData.contact?.phone || '',
        email: patientData.email || patientData.contact?.email || null,
        address: {
          street: patientData.addressStreet || patientData.contact?.address?.street || null,
          city: patientData.addressCity || patientData.contact?.address?.city || 'Bengaluru',
          state: patientData.addressState || patientData.contact?.address?.state || 'Karnataka',
          postalCode: patientData.addressPostalCode || patientData.contact?.address?.postalCode || null,
          country: 'India',
        },
      },
      emergencyContact: {
        name: patientData.emergencyName || patientData.emergencyContact?.name || null,
        relation: patientData.emergencyRelation || patientData.emergencyContact?.relation || null,
        phone: patientData.emergencyPhone || patientData.emergencyContact?.phone || null,
      },
      allergies: Array.isArray(patientData.allergies)
        ? patientData.allergies
        : (patientData.allergiesString ? patientData.allergiesString.split(',').map(s => ({ substance: s.trim(), severity: 'Moderate' })) : []),
      medicalHistory: Array.isArray(patientData.medicalHistory)
        ? patientData.medicalHistory
        : (patientData.medicalHistoryNotes ? [{ condition: patientData.medicalHistoryNotes, since: new Date().getFullYear().toString() }] : []),
      lastVisit: new Date().toISOString().split('T')[0],
      status: patientData.status || 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      notes: patientData.notes || '',
    };

    // Attempt real backend POST
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: newPatientRecord.firstName,
          lastName: newPatientRecord.lastName,
          dateOfBirth: newPatientRecord.dateOfBirth,
          gender: newPatientRecord.gender,
          bloodGroup: newPatientRecord.bloodGroup,
          contact: newPatientRecord.contact,
          emergencyContact: newPatientRecord.emergencyContact,
          allergies: newPatientRecord.allergies,
          medicalHistory: newPatientRecord.medicalHistory,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          // Sync with local list
          const list = getLocalPatients();
          list.unshift(resData.data);
          saveLocalPatients(list);
          return { success: true, patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Backend offline fallback
    }

    // Save locally
    const list = getLocalPatients();
    list.unshift(newPatientRecord);
    saveLocalPatients(list);

    return { success: true, patient: newPatientRecord, isLiveApi: false };
  },

  // PUT Update Patient
  async updatePatient(id, patientData) {
    const list = getLocalPatients();
    const index = list.findIndex(p => p.id === id || p.patientId === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }

    const current = list[index];
    const fullName = `${patientData.firstName ?? current.firstName} ${patientData.lastName ?? current.lastName}`.trim();
    const updatedAge = patientData.dateOfBirth ? calculateAge(patientData.dateOfBirth) : current.age;

    const updatedRecord = {
      ...current,
      firstName: patientData.firstName ?? current.firstName,
      lastName: patientData.lastName ?? current.lastName,
      name: fullName,
      dateOfBirth: patientData.dateOfBirth ?? current.dateOfBirth,
      age: updatedAge,
      gender: patientData.gender ?? current.gender,
      bloodGroup: patientData.bloodGroup ?? current.bloodGroup,
      status: patientData.status ?? current.status,
      contact: {
        ...current.contact,
        phone: patientData.phone ?? current.contact?.phone,
        email: patientData.email ?? current.contact?.email,
        address: {
          ...current.contact?.address,
          street: patientData.addressStreet ?? current.contact?.address?.street,
          city: patientData.addressCity ?? current.contact?.address?.city,
          state: patientData.addressState ?? current.contact?.address?.state,
          postalCode: patientData.addressPostalCode ?? current.contact?.address?.postalCode,
        },
      },
      emergencyContact: {
        ...current.emergencyContact,
        name: patientData.emergencyName ?? current.emergencyContact?.name,
        relation: patientData.emergencyRelation ?? current.emergencyContact?.relation,
        phone: patientData.emergencyPhone ?? current.emergencyContact?.phone,
      },
      notes: patientData.notes ?? current.notes,
    };

    // Attempt real backend PUT
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedRecord),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          list[index] = resData.data;
          saveLocalPatients(list);
          return { success: true, patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Backend offline fallback
    }

    list[index] = updatedRecord;
    saveLocalPatients(list);

    return { success: true, patient: updatedRecord, isLiveApi: false };
  },
};

export default patientService;
