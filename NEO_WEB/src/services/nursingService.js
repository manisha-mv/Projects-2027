// services/nursingService.js
// Nursing module — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const VITALS_KEY = 'neo_hms_nursing_vitals_v3';
const NOTES_KEY  = 'neo_hms_nursing_notes_v3';
const TASKS_KEY  = 'neo_hms_nursing_tasks_v3';
const token = () => localStorage.getItem('neohms_token');
const now = () => new Date().toISOString();

const SEED_TASKS = [
  { id: 'MT-001', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Telmisartan 40mg', dosage: '40mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Administered post breakfast' },
  { id: 'MT-002', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Amlodipine 5mg', dosage: '5mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: '' },
  { id: 'MT-003', patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Metformin 500mg', dosage: '500mg', route: 'Oral', scheduledTime: '13:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Give post lunch with water' },
  { id: 'MT-004', patientId: 'P10033', patientName: 'Sunita Iyer', ward: 'Cardiology ICU', bed: 'CAR-02', medicine: 'Heparin 5000 IU', dosage: '5000 IU', route: 'IV', scheduledTime: '10:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Verify coagulation profile before giving' },
  { id: 'MT-005', patientId: 'P10033', patientName: 'Sunita Iyer', ward: 'Cardiology ICU', bed: 'CAR-02', medicine: 'Atorvastatin 40mg', dosage: '40mg', route: 'Oral', scheduledTime: '20:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Bedtime dose' },
  { id: 'MT-006', patientId: 'P10033', patientName: 'Sunita Iyer', ward: 'Cardiology ICU', bed: 'CAR-02', medicine: 'Clopidogrel 75mg', dosage: '75mg', route: 'Oral', scheduledTime: '09:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Post antiplatelet therapy' },
  { id: 'MT-007', patientId: 'P10047', patientName: 'Prakash Nair', ward: 'Neurology Ward', bed: 'NEU-07', medicine: 'Sumatriptan 50mg', dosage: '50mg', route: 'Oral', scheduledTime: '11:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Give on empty stomach' },
  { id: 'MT-008', patientId: 'P10047', patientName: 'Prakash Nair', ward: 'Neurology Ward', bed: 'NEU-07', medicine: 'Propranolol 40mg', dosage: '40mg', route: 'Oral', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Migraine prophylaxis' },
  { id: 'MT-009', patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Metoprolol 25mg', dosage: '25mg', route: 'Oral', scheduledTime: '09:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Check pulse rate before giving (<60 hold)' },
  { id: 'MT-010', patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Furosemide 40mg', dosage: '40mg', route: 'IV Push', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Monitor urine output post injection' },
  { id: 'MT-011', patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Nitroglycerin Patch 5mg', dosage: '5mg/24h', route: 'Transdermal', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Applied on upper chest' },
  { id: 'MT-012', patientId: 'P10069', patientName: 'Deepa Thomas', ward: 'Emergency Ward', bed: 'E-07', medicine: 'Ondansetron 4mg', dosage: '4mg', route: 'IV', scheduledTime: '09:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Nausea relief' },
  { id: 'MT-013', patientId: 'P10069', patientName: 'Deepa Thomas', ward: 'Emergency Ward', bed: 'E-07', medicine: 'Tramadol 50mg', dosage: '50mg', route: 'IV', scheduledTime: '10:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Acute pain management' },
  { id: 'MT-014', patientId: 'P10069', patientName: 'Deepa Thomas', ward: 'Emergency Ward', bed: 'E-07', medicine: 'Piperacillin-Tazobactam 4.5g', dosage: '4.5g', route: 'IV Infusion', scheduledTime: '12:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Run over 30 minutes' },
  { id: 'MT-015', patientId: 'P10041', patientName: 'Meena Devi', ward: 'Female Surgical Ward', bed: 'FSW-03', medicine: 'Ceftriaxone 1g', dosage: '1g', route: 'IV Infusion', scheduledTime: '12:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Post-op prophylactic antibiotic' },
  { id: 'MT-016', patientId: 'P10041', patientName: 'Meena Devi', ward: 'Female Surgical Ward', bed: 'FSW-03', medicine: 'Paracetamol 650mg', dosage: '650mg', route: 'Oral', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'For postoperative analgesia' },
  { id: 'MT-017', patientId: 'P10089', patientName: 'Lakshmi Pillai', ward: 'Paediatric Ward', bed: 'PW-02', medicine: 'Paracetamol Syrup', dosage: '5ml (125mg)', route: 'Oral', scheduledTime: '13:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'For fever (>100°F)' },
  { id: 'MT-018', patientId: 'P10089', patientName: 'Lakshmi Pillai', ward: 'Paediatric Ward', bed: 'PW-02', medicine: 'Amoxicillin Syrup 250mg', dosage: '5ml', route: 'Oral', scheduledTime: '10:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Given with milk' },
  { id: 'MT-019', patientId: 'P10102', patientName: 'Vikram Malhotra', ward: 'Orthopaedic Ward', bed: 'ORTHO-05', medicine: 'Tramadol 50mg', dosage: '50mg', route: 'IV', scheduledTime: '10:30', status: 'Pending', completedAt: null, givenBy: null, notes: 'Post-fracture pain management' },
  { id: 'MT-020', patientId: 'P10102', patientName: 'Vikram Malhotra', ward: 'Orthopaedic Ward', bed: 'ORTHO-05', medicine: 'Pantoprazole 40mg', dosage: '40mg', route: 'IV', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: '' },
  { id: 'MT-021', patientId: 'P10102', patientName: 'Vikram Malhotra', ward: 'Orthopaedic Ward', bed: 'ORTHO-05', medicine: 'Enoxaparin 40mg', dosage: '40mg (0.4ml)', route: 'Subcutaneous', scheduledTime: '21:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'DVT prophylaxis' },
  { id: 'MT-022', patientId: 'P10115', patientName: 'Ananya Roy', ward: 'General Ward', bed: 'GW-12', medicine: 'Insulin Regular 6 Units', dosage: '6 Units', route: 'Subcutaneous', scheduledTime: '12:30', status: 'Pending', completedAt: null, givenBy: null, notes: 'Pre-lunch blood glucose check required' },
  { id: 'MT-023', patientId: 'P10115', patientName: 'Ananya Roy', ward: 'General Ward', bed: 'GW-12', medicine: 'Glargine Insulin 14 Units', dosage: '14 Units', route: 'Subcutaneous', scheduledTime: '22:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Basal bedtime dose' },
  { id: 'MT-024', patientId: 'P10128', patientName: 'Suresh Gupta', ward: 'Pulmonology Ward', bed: 'PUL-04', medicine: 'Salbutamol Nebulization', dosage: '2.5mg', route: 'Inhalation', scheduledTime: '11:30', status: 'Pending', completedAt: null, givenBy: null, notes: 'Administer with 3L oxygen flow' },
  { id: 'MT-025', patientId: 'P10128', patientName: 'Suresh Gupta', ward: 'Pulmonology Ward', bed: 'PUL-04', medicine: 'Deriphyllin 150mg', dosage: '150mg', route: 'Oral', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Post lunch' },
  { id: 'MT-026', patientId: 'P10128', patientName: 'Suresh Gupta', ward: 'Pulmonology Ward', bed: 'PUL-04', medicine: 'Hydrocortisone 100mg', dosage: '100mg', route: 'IV Push', scheduledTime: '08:30', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Severe bronchospasm dose' },
  { id: 'MT-027', patientId: 'P10055', patientName: 'Fatima Begum', ward: 'Maternity Ward', bed: 'MAT-03', medicine: 'Oxytocin Infusion 10 IU', dosage: '10 IU in 500ml RL', route: 'IV Infusion', scheduledTime: '09:30', status: 'Completed', completedAt: now(), givenBy: 'Maternity Nurse', notes: 'Labor induction protocol' },
  { id: 'MT-028', patientId: 'P10062', patientName: 'Rajesh Varma', ward: 'Orthopaedic Ward', bed: 'ORT-11', medicine: 'Cefuroxime 750mg', dosage: '750mg', route: 'IV', scheduledTime: '10:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Post-op day 4 antibiotic' },
  { id: 'MT-029', patientId: 'P10052', patientName: 'Mohammed Aslam', ward: 'General Ward', bed: 'GW-05', medicine: 'Budesonide Inhaler 200mcg', dosage: '2 puffs', route: 'Inhalation', scheduledTime: '08:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Rinse mouth after use' },
  { id: 'MT-030', patientId: 'P10018', patientName: 'Karthik Suresh', ward: 'Neurology Ward', bed: 'NEU-03', medicine: 'Levetiracetam 500mg', dosage: '500mg', route: 'Oral', scheduledTime: '09:00', status: 'Completed', completedAt: now(), givenBy: 'Nurse Station', notes: 'Anticonvulsant maintenance' },
];

const SEED_VITALS = [
  { id: 'V-001', patientId: 'P10025', patientName: 'Arun Kumar', bp: '140/90', pulse: 78, temp: 98.6, spo2: 97, rr: 18, weight: 72, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Post-morning round. BP elevated.', isCritical: false },
  { id: 'V-002', patientId: 'P10033', patientName: 'Sunita Iyer', bp: '90/60', pulse: 102, temp: 99.2, spo2: 94, rr: 22, weight: 58, recordedAt: now(), recordedBy: 'ICU Nurse Station', notes: 'Borderline BP — Dr. Kiran alerted', isCritical: false },
  { id: 'V-003', patientId: 'P10067', patientName: 'Rajesh Nair', bp: '85/55', pulse: 118, temp: 100.4, spo2: 89, rr: 26, weight: 68, recordedAt: now(), recordedBy: 'ICU Nurse Station', notes: 'CRITICAL: Low SpO2 (89%) and tachycardia. O2 mask started.', isCritical: true },
  { id: 'V-004', patientId: 'P10047', patientName: 'Prakash Nair', bp: '130/85', pulse: 72, temp: 98.4, spo2: 98, rr: 16, weight: 65, recordedAt: now(), recordedBy: 'Neuro Nurse Station', notes: 'Stable neurology observation', isCritical: false },
  { id: 'V-005', patientId: 'P10041', patientName: 'Meena Devi', bp: '118/76', pulse: 80, temp: 98.8, spo2: 99, rr: 17, weight: 61, recordedAt: now(), recordedBy: 'Surgical Nurse', notes: 'Surgical dressing clean and dry', isCritical: false },
  { id: 'V-006', patientId: 'P10089', patientName: 'Lakshmi Pillai', bp: '105/70', pulse: 110, temp: 101.1, spo2: 96, rr: 24, weight: 18, recordedAt: now(), recordedBy: 'Paediatric Nurse', notes: 'Fever present. Cold sponge applied.', isCritical: false },
  { id: 'V-007', patientId: 'P10102', patientName: 'Vikram Malhotra', bp: '135/88', pulse: 84, temp: 98.6, spo2: 97, rr: 18, weight: 80, recordedAt: now(), recordedBy: 'Ortho Nurse', notes: 'Right leg traction intact', isCritical: false },
  { id: 'V-008', patientId: 'P10128', patientName: 'Suresh Gupta', bp: '142/92', pulse: 96, temp: 99.0, spo2: 91, rr: 28, weight: 74, recordedAt: now(), recordedBy: 'Pulmonology Nurse', notes: 'CRITICAL: Dyspnea and SpO2 91%. Nebulization initiated.', isCritical: true },
  { id: 'V-009', patientId: 'P10069', patientName: 'Deepa Thomas', bp: '100/65', pulse: 108, temp: 101.4, spo2: 95, rr: 22, weight: 54, recordedAt: now(), recordedBy: 'Emergency Nurse', notes: 'Pre-op appendectomy workup. Febrile.', isCritical: false },
  { id: 'V-010', patientId: 'P10055', patientName: 'Fatima Begum', bp: '122/82', pulse: 86, temp: 98.4, spo2: 99, rr: 18, weight: 64, recordedAt: now(), recordedBy: 'Maternity Nurse', notes: 'Labor monitoring active', isCritical: false },
  { id: 'V-011', patientId: 'P10062', patientName: 'Rajesh Varma', bp: '128/84', pulse: 76, temp: 98.6, spo2: 98, rr: 16, weight: 78, recordedAt: now(), recordedBy: 'Ortho Nurse', notes: 'Post hip replacement day 4. Mobilizing.', isCritical: false },
  { id: 'V-012', patientId: 'P10115', patientName: 'Ananya Roy', bp: '110/72', pulse: 82, temp: 98.2, spo2: 98, rr: 16, weight: 52, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Pre-meal glycemic status', isCritical: false },
  { id: 'V-013', patientId: 'P10052', patientName: 'Mohammed Aslam', bp: '124/80', pulse: 88, temp: 98.6, spo2: 96, rr: 20, weight: 70, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Asthma observation, mild wheeze', isCritical: false },
  { id: 'V-014', patientId: 'P10018', patientName: 'Karthik Suresh', bp: '118/78', pulse: 74, temp: 98.4, spo2: 99, rr: 16, weight: 67, recordedAt: now(), recordedBy: 'Neuro Nurse', notes: 'Post seizure observation stable', isCritical: false },
  { id: 'V-015', patientId: 'P10031', patientName: 'Lalitha Iyer', bp: '132/86', pulse: 80, temp: 98.6, spo2: 97, rr: 17, weight: 62, recordedAt: now(), recordedBy: 'Cardio Nurse', notes: 'Cardiac telemetric monitoring steady', isCritical: false },
  { id: 'V-016', patientId: 'P10011', patientName: 'Kavitha Rao', bp: '116/74', pulse: 72, temp: 98.2, spo2: 99, rr: 15, weight: 56, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Pre-discharge check', isCritical: false },
  { id: 'V-017', patientId: 'P10071', patientName: 'Ravi Shankar', bp: '150/95', pulse: 90, temp: 98.6, spo2: 97, rr: 19, weight: 82, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'CRITICAL: High BP (150/95). Physician notified.', isCritical: true },
  { id: 'V-018', patientId: 'P10025', patientName: 'Arun Kumar', bp: '136/88', pulse: 76, temp: 98.4, spo2: 98, rr: 16, weight: 72, recordedAt: now(), recordedBy: 'Nurse Station', notes: 'Afternoon re-evaluation', isCritical: false },
  { id: 'V-019', patientId: 'P10033', patientName: 'Sunita Iyer', bp: '105/70', pulse: 88, temp: 98.6, spo2: 97, rr: 18, weight: 58, recordedAt: now(), recordedBy: 'ICU Nurse Station', notes: 'BP improved after IV fluid bolus', isCritical: false },
  { id: 'V-020', patientId: 'P10067', patientName: 'Rajesh Nair', bp: '100/68', pulse: 92, temp: 99.1, spo2: 94, rr: 20, weight: 68, recordedAt: now(), recordedBy: 'ICU Nurse Station', notes: 'Post-diuretic SpO2 and BP stabilization', isCritical: false },
  { id: 'V-021', patientId: 'P10069', patientName: 'Deepa Thomas', bp: '112/74', pulse: 90, temp: 99.0, spo2: 97, rr: 18, weight: 54, recordedAt: now(), recordedBy: 'Emergency Nurse', notes: 'Post-analgesic vital check', isCritical: false },
  { id: 'V-022', patientId: 'P10102', patientName: 'Vikram Malhotra', bp: '130/82', pulse: 78, temp: 98.4, spo2: 98, rr: 16, weight: 80, recordedAt: now(), recordedBy: 'Ortho Nurse', notes: 'Pain score reduced to 3/10', isCritical: false },
  { id: 'V-023', patientId: 'P10128', patientName: 'Suresh Gupta', bp: '134/86', pulse: 84, temp: 98.8, spo2: 95, rr: 22, weight: 74, recordedAt: now(), recordedBy: 'Pulmonology Nurse', notes: 'Post-nebulization SpO2 recovery', isCritical: false },
  { id: 'V-024', patientId: 'P10089', patientName: 'Lakshmi Pillai', bp: '100/65', pulse: 98, temp: 99.4, spo2: 98, rr: 20, weight: 18, recordedAt: now(), recordedBy: 'Paediatric Nurse', notes: 'Fever reduced after paracetamol', isCritical: false },
  { id: 'V-025', patientId: 'P10062', patientName: 'Rajesh Varma', bp: '124/80', pulse: 74, temp: 98.4, spo2: 99, rr: 16, weight: 78, recordedAt: now(), recordedBy: 'Ortho Nurse', notes: 'Evening check — afebrile', isCritical: false },
];

const SEED_NOTES = [
  { id: 'NN-001', patientId: 'P10067', patientName: 'Rajesh Nair', note: 'Patient experienced acute shortness of breath at 09:25. SpO2 dropped to 89%. Placed on high-flow O2. Dr. Kiran Reddy attended and adjusted IV diuretic dose.', shift: 'Morning', recordedBy: 'Head Nurse Station', recordedAt: now() },
  { id: 'NN-002', patientId: 'P10033', patientName: 'Sunita Iyer', note: 'Patient complained of mild chest discomfort during morning round. ECG completed and handed over to cardiology registrar.', shift: 'Morning', recordedBy: 'ICU Nurse', recordedAt: now() },
  { id: 'NN-003', patientId: 'P10025', patientName: 'Arun Kumar', note: 'Morning antihypertensives administered. Patient ambulating comfortably without dizziness.', shift: 'Morning', recordedBy: 'Staff Nurse', recordedAt: now() },
  { id: 'NN-004', patientId: 'P10041', patientName: 'Meena Devi', note: 'Abdominal surgical wound site inspected. No redness or discharge noted. Foley catheter drained 450ml clear urine.', shift: 'Morning', recordedBy: 'Surgical Staff Nurse', recordedAt: now() },
  { id: 'NN-005', patientId: 'P10089', patientName: 'Lakshmi Pillai', note: 'Child irritable due to fever (101.1°F). Oral syrup Paracetamol administered. Mother educated on fluid intake.', shift: 'Morning', recordedBy: 'Paediatric Nurse', recordedAt: now() },
  { id: 'NN-006', patientId: 'P10102', patientName: 'Vikram Malhotra', note: 'Pain score 6/10 at right femur site. IV Tramadol administered as per order. Repositioned with pillow support.', shift: 'Morning', recordedBy: 'Ortho Staff Nurse', recordedAt: now() },
  { id: 'NN-007', patientId: 'P10128', patientName: 'Suresh Gupta', note: 'Patient exhibits wheezing in bilateral lung fields. Salbutamol nebulization given with positive symptom relief.', shift: 'Morning', recordedBy: 'ICU Staff Nurse', recordedAt: now() },
  { id: 'NN-008', patientId: 'P10069', patientName: 'Deepa Thomas', note: 'Acute abdominal pain localized to right lower quadrant. Pre-op prep initiated for emergency appendectomy.', shift: 'Morning', recordedBy: 'Emergency Nurse', recordedAt: now() },
  { id: 'NN-009', patientId: 'P10055', patientName: 'Fatima Begum', note: 'Uterine contractions 3 in 10 minutes. Oxytocin drip titrated per order. Obstetrician informed.', shift: 'Morning', recordedBy: 'Maternity Staff Nurse', recordedAt: now() },
  { id: 'NN-010', patientId: 'P10062', patientName: 'Rajesh Varma', note: 'Post hip replacement day 4. Wound dry. Physiotherapist assisted patient with frame walking in corridor.', shift: 'Morning', recordedBy: 'Ortho Staff Nurse', recordedAt: now() },
  { id: 'NN-011', patientId: 'P10115', patientName: 'Ananya Roy', note: 'Pre-lunch capillary blood glucose 182 mg/dL. 6 Units regular insulin given SC in abdomen.', shift: 'Morning', recordedBy: 'Staff Nurse', recordedAt: now() },
  { id: 'NN-012', patientId: 'P10052', patientName: 'Mohammed Aslam', note: 'Complained of nocturnal wheezing. Budesonide inhaler administered. SpO2 maintained at 96% on room air.', shift: 'Morning', recordedBy: 'Ward Nurse', recordedAt: now() },
  { id: 'NN-013', patientId: 'P10047', patientName: 'Prakash Nair', note: 'Migraine headache reported 7/10. Sumatriptan given. Room darkened and quiet environment provided.', shift: 'Morning', recordedBy: 'Neuro Staff Nurse', recordedAt: now() },
  { id: 'NN-014', patientId: 'P10018', patientName: 'Karthik Suresh', note: 'Neurological checks intact (GCS 15/15). Oral Levetiracetam given on time without side effects.', shift: 'Morning', recordedBy: 'Neuro Staff Nurse', recordedAt: now() },
  { id: 'NN-015', patientId: 'P10031', patientName: 'Lalitha Iyer', note: 'Telemetry strip clean. Patient expressed feeling anxious; reassurance provided by nursing team.', shift: 'Morning', recordedBy: 'Cardio Staff Nurse', recordedAt: now() },
  { id: 'NN-016', patientId: 'P10011', patientName: 'Kavitha Rao', note: 'Final discharge summary prepared. Discharge medications explained to patient and attendant.', shift: 'Morning', recordedBy: 'Senior Nurse', recordedAt: now() },
  { id: 'NN-017', patientId: 'P10071', patientName: 'Ravi Shankar', note: 'Blood pressure elevated to 150/95. Dr. Kiran notified. Patient advised to rest in semi-fowler position.', shift: 'Morning', recordedBy: 'Staff Nurse', recordedAt: now() },
  { id: 'NN-018', patientId: 'P10025', patientName: 'Arun Kumar', note: 'Repeat BP after resting 30 mins was 136/88. Patient counseled regarding dietary sodium restriction.', shift: 'Afternoon', recordedBy: 'Staff Nurse', recordedAt: now() },
  { id: 'NN-019', patientId: 'P10033', patientName: 'Sunita Iyer', note: 'Post-stent femoral puncture site checked for hematoma. No bleeding, distal pulses palpable.', shift: 'Afternoon', recordedBy: 'ICU Nurse', recordedAt: now() },
  { id: 'NN-020', patientId: 'P10067', patientName: 'Rajesh Nair', note: 'Respirations settled to 20/min post Furosemide injection. Fluid intake-output chart updated.', shift: 'Afternoon', recordedBy: 'ICU Nurse', recordedAt: now() },
  { id: 'NN-021', patientId: 'P10102', patientName: 'Vikram Malhotra', note: 'Reassessed pain after IV Tramadol — patient reports improvement (3/10). Resting comfortably.', shift: 'Afternoon', recordedBy: 'Ortho Staff Nurse', recordedAt: now() },
  { id: 'NN-022', patientId: 'P10128', patientName: 'Suresh Gupta', note: 'Chest auscultation post nebulization shows reduced rhonchi. SpO2 improved to 95% on room air.', shift: 'Afternoon', recordedBy: 'Pulmonology Nurse', recordedAt: now() },
];

const getLocal = (key, seed) => {
  try {
    const d = localStorage.getItem(key);
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length >= seed.length) {
        return parsed;
      }
    }
  } catch { /* */ }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
};
const saveLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* */ }
};
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const nursingService = {
  async getAssignedPatients() {
    try { const res = await fetch(`${API_BASE_URL}/nursing/patients`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data && d.data.length > 0) return { patients: d.data, isLiveApi: true }; } } catch { /* */ }
    // Build from tasks
    const tasks = getLocal(TASKS_KEY, SEED_TASKS);
    const map = {};
    tasks.forEach(t => {
      if (!map[t.patientId]) {
        map[t.patientId] = { patientId: t.patientId, patientName: t.patientName, ward: t.ward, bed: t.bed, pendingTasks: 0 };
      }
      if (t.status === 'Pending') map[t.patientId].pendingTasks++;
    });
    return { patients: Object.values(map), isLiveApi: false };
  },

  async getMedicationTasks(params = {}) {
    const { status = '', patientId = '' } = params;
    try { const q = new URLSearchParams({ status, patientId }).toString(); const res = await fetch(`${API_BASE_URL}/nursing/tasks?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data && d.data.length > 0) return { tasks: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getLocal(TASKS_KEY, SEED_TASKS);
    if (status && status !== 'All') list = list.filter(t => t.status === status);
    if (patientId) list = list.filter(t => t.patientId === patientId);
    return { tasks: list, isLiveApi: false };
  },

  async completeTask(id, notes = '') {
    const list = getLocal(TASKS_KEY, SEED_TASKS);
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    try { const res = await fetch(`${API_BASE_URL}/nursing/tasks/${id}/complete`, { method: 'PUT', headers: h(), body: JSON.stringify({ notes }) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(TASKS_KEY, list); return { success: true, task: d.data, isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], status: 'Completed', completedAt: now(), notes };
    saveLocal(TASKS_KEY, list);
    return { success: true, task: list[idx], isLiveApi: false };
  },

  async recordVitals(data) {
    const list = getLocal(VITALS_KEY, SEED_VITALS);
    const id = `V-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, ...data, recordedAt: now() };
    const isCritical = (data.spo2 && data.spo2 < 92) || (data.pulse && (data.pulse < 50 || data.pulse > 120));
    if (isCritical) record.isCritical = true;
    try { const res = await fetch(`${API_BASE_URL}/nursing/vitals`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(VITALS_KEY, list); return { success: true, vitals: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record);
    saveLocal(VITALS_KEY, list);
    return { success: true, vitals: record, isLiveApi: false };
  },

  async getVitals(patientId = '') {
    try { const res = await fetch(`${API_BASE_URL}/nursing/vitals${patientId ? `?patientId=${patientId}` : ''}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data && d.data.length > 0) return { vitals: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal(VITALS_KEY, SEED_VITALS);
    return { vitals: patientId ? list.filter(v => v.patientId === patientId) : list, isLiveApi: false };
  },

  async addNote(data) {
    const list = getLocal(NOTES_KEY, SEED_NOTES);
    const id = `NN-${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, ...data, recordedAt: now() };
    try { const res = await fetch(`${API_BASE_URL}/nursing/notes`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(NOTES_KEY, list); return { success: true, note: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record);
    saveLocal(NOTES_KEY, list);
    return { success: true, note: record, isLiveApi: false };
  },

  async getNotes(patientId = '') {
    try { const res = await fetch(`${API_BASE_URL}/nursing/notes${patientId ? `?patientId=${patientId}` : ''}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data && d.data.length > 0) return { notes: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getLocal(NOTES_KEY, SEED_NOTES);
    return { notes: patientId ? list.filter(n => n.patientId === patientId) : list, isLiveApi: false };
  },
};

export default nursingService;
