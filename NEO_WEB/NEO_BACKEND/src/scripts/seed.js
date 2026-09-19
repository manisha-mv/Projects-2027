/**
 * NEO-HMS Comprehensive Seed Script
 * ─────────────────────────────────
 * Seeds: Users (all roles), Patients, Beds, Admissions, Appointments,
 *        Lab Orders, Invoices, Notifications, Audit Logs.
 *
 * Run: node src/scripts/seed.js
 * or : npm run seed (from NEO_BACKEND directory)
 *
 * NOTE: This is idempotent — running it multiple times is safe.
 *       It clears all existing records before re-seeding.
 */

require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env')
});

const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const { Bed, Admission } = require('../models/IPD');
const Appointment = require('../models/Appointment');
const { LabOrder } = require('../models/Laboratory');
const Invoice = require('../models/Billing');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { Vitals, NursingNote, MedicationTask } = require('../models/Nursing');
const { RadiologyOrder } = require('../models/Radiology');

const today = new Date().toISOString().split('T')[0];
const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
const now = new Date().toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// USERS — All roles
// ─────────────────────────────────────────────────────────────────────────────
const SEED_USERS = [
  // ─── Administrators ────────────────────────────────────────────────────────
  {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@hospital.com',
    password: 'password123',
    role: 'admin',
    department: 'Administration',
    employeeId: 'EMP-0001',
    phone: '9800000001',
  },
  {
    firstName: 'Arjun',
    lastName: 'Sharma',
    email: 'superadmin@neo-hms.com',
    password: 'SuperAdmin@2026',
    role: 'super_admin',
    department: 'Administration',
    employeeId: 'EMP-0002',
    phone: '9800000002',
  },

  // ─── Doctors ───────────────────────────────────────────────────────────────
  {
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    email: 'doctor@hospital.com',
    password: 'password123',
    role: 'doctor',
    department: 'General Medicine',
    employeeId: 'EMP-0003',
    phone: '9800000003',
  },
  {
    firstName: 'Dr. Kiran',
    lastName: 'Reddy',
    email: 'cardiologist@neo-hms.com',
    password: 'Doctor@2026',
    role: 'doctor',
    department: 'Cardiology',
    employeeId: 'EMP-0004',
    phone: '9800000004',
  },

  // ─── Nurses ────────────────────────────────────────────────────────────────
  {
    firstName: 'Nurse',
    lastName: 'Station',
    email: 'nurse@hospital.com',
    password: 'password123',
    role: 'nurse',
    department: 'Nursing',
    employeeId: 'EMP-0005',
    phone: '9800000005',
  },

  // ─── Receptionist ──────────────────────────────────────────────────────────
  {
    firstName: 'Reception',
    lastName: 'Desk',
    email: 'reception@hospital.com',
    password: 'password123',
    role: 'receptionist',
    department: 'Front Desk',
    employeeId: 'EMP-0006',
    phone: '9800000006',
  },

  // ─── Laboratory ────────────────────────────────────────────────────────────
  {
    firstName: 'Laboratory',
    lastName: 'Dept',
    email: 'lab@hospital.com',
    password: 'password123',
    role: 'lab_technician',
    department: 'Laboratory',
    employeeId: 'EMP-0007',
    phone: '9800000007',
  },

  // ─── Radiology ─────────────────────────────────────────────────────────────
  {
    firstName: 'Radiology',
    lastName: 'Dept',
    email: 'radiology@hospital.com',
    password: 'password123',
    role: 'radiologist',
    department: 'Radiology',
    employeeId: 'EMP-0008',
    phone: '9800000008',
  },

  // ─── Pharmacy ──────────────────────────────────────────────────────────────
  {
    firstName: 'Pharmacy',
    lastName: 'Team',
    email: 'pharmacy@hospital.com',
    password: 'password123',
    role: 'pharmacist',
    department: 'Pharmacy',
    employeeId: 'EMP-0009',
    phone: '9800000009',
  },

  // ─── Billing ───────────────────────────────────────────────────────────────
  {
    firstName: 'Billing',
    lastName: 'Dept',
    email: 'billing@hospital.com',
    password: 'password123',
    role: 'billing',
    department: 'Finance',
    employeeId: 'EMP-0010',
    phone: '9800000010',
  },

  // ─── Insurance ─────────────────────────────────────────────────────────────
  {
    firstName: 'Insurance',
    lastName: 'Team',
    email: 'insurance@hospital.com',
    password: 'password123',
    role: 'insurance',
    department: 'Insurance',
    employeeId: 'EMP-0011',
    phone: '9800000011',
  },

  // ─── Complaint Officer ─────────────────────────────────────────────────────
  {
    firstName: 'Complaint',
    lastName: 'Officer',
    email: 'complaint@hospital.com',
    password: 'password123',
    role: 'complaint_officer',
    department: 'Patient Relations',
    employeeId: 'EMP-0012',
    phone: '9800000012',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────────────────────
const SEED_PATIENTS = [
  {
    patientId: 'P10025',
    firstName: 'Arun',
    lastName: 'Kumar',
    dateOfBirth: '1984-05-14',
    gender: 'Male',
    bloodGroup: 'O+',
    contact: {
      phone: '+91 98450 12345',
      email: 'arun.kumar@gmail.com'
    },
    status: 'Inpatient',
  },
  {
    patientId: 'P10041',
    firstName: 'Meena',
    lastName: 'Devi',
    dateOfBirth: '1991-11-20',
    gender: 'Female',
    bloodGroup: 'B+',
    contact: {
      phone: '+91 97112 88341',
      email: 'meena.devi@outlook.com'
    },
    status: 'Outpatient',
  },
  {
    patientId: 'P10067',
    firstName: 'Rajesh',
    lastName: 'Nair',
    dateOfBirth: '1968-02-10',
    gender: 'Male',
    bloodGroup: 'A+',
    contact: {
      phone: '+91 94470 55123',
      email: 'rajesh.nair@yahoo.com'
    },
    status: 'Inpatient',
  },
  {
    patientId: 'P10089',
    firstName: 'Lakshmi',
    lastName: 'Pillai',
    dateOfBirth: '1975-08-22',
    gender: 'Female',
    bloodGroup: 'AB+',
    contact: {
      phone: '+91 99001 77233',
      email: 'lakshmi.pillai@gmail.com'
    },
    status: 'Outpatient',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BEDS
// ─────────────────────────────────────────────────────────────────────────────
const SEED_BEDS = [
  { bedId: 'GW-01', ward: 'General Ward', type: 'Standard', status: 'Available' },
  { bedId: 'GW-02', ward: 'General Ward', type: 'Standard', status: 'Available' },
  { bedId: 'GW-03', ward: 'General Ward', type: 'Standard', status: 'Maintenance' },
  { bedId: 'GW-04', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10025', patientName: 'Arun Kumar' },
  { bedId: 'GW-05', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10052', patientName: 'Mohammed Aslam' },
  { bedId: 'GW-10', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10075', patientName: 'Anil Deshmukh' },
  { bedId: 'GW-12', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10115', patientName: 'Ananya Roy' },
  { bedId: 'GW-15', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10011', patientName: 'Kavitha Rao' },
  { bedId: 'CAR-01', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10155', patientName: 'Venkat Raman' },
  { bedId: 'CAR-02', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10033', patientName: 'Sunita Iyer' },
  { bedId: 'CAR-05', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10031', patientName: 'Lalitha Iyer' },
  { bedId: 'CAR-08', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10071', patientName: 'Ravi Shankar' },
  { bedId: 'ICU-02', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10067', patientName: 'Rajesh Nair' },
  { bedId: 'NEU-01', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10060', patientName: 'Sunita Pillai' },
  { bedId: 'NEU-03', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10018', patientName: 'Karthik Suresh' },
  { bedId: 'NEU-07', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10047', patientName: 'Prakash Nair' },
  { bedId: 'NEU-08', ward: 'Neurology', type: 'Standard', status: 'Available' },
  { bedId: 'MAT-01', ward: 'Maternity', type: 'Maternity', status: 'Occupied', patientId: 'P10055', patientName: 'Fatima Begum' },
  { bedId: 'MAT-03', ward: 'Maternity', type: 'Maternity', status: 'Occupied', patientId: 'P10041', patientName: 'Meena Devi' },
  { bedId: 'ORT-04', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10085', patientName: 'Suresh Menon' },
  { bedId: 'ORT-05', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10102', patientName: 'Vikram Malhotra' },
  { bedId: 'ORT-11', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10062', patientName: 'Rajesh Varma' },
  { bedId: 'PW-01', ward: 'Paediatrics', type: 'Standard', status: 'Available' },
  { bedId: 'PW-02', ward: 'Paediatrics', type: 'Standard', status: 'Occupied', patientId: 'P10089', patientName: 'Lakshmi Pillai' },
  { bedId: 'E-07', ward: 'Emergency', type: 'Emergency', status: 'Occupied', patientId: 'P10069', patientName: 'Deepa Thomas' },
  { bedId: 'E-08', ward: 'Emergency', type: 'Emergency', status: 'Available' },
  { bedId: 'SICU-01', ward: 'Surgical ICU', type: 'ICU', status: 'Occupied', patientId: 'P10150', patientName: 'Farida Khan' },
  { bedId: 'PUL-02', ward: 'Pulmonology', type: 'Standard', status: 'Occupied', patientId: 'P10098', patientName: 'Geetha Krishnan' },
  { bedId: 'PUL-04', ward: 'Pulmonology', type: 'Standard', status: 'Occupied', patientId: 'P10128', patientName: 'Suresh Gupta' },
  { bedId: 'NEP-01', ward: 'Nephrology', type: 'Standard', status: 'Occupied', patientId: 'P10120', patientName: 'Harish Chandra' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    console.log('\n🏥  NEO-HMS Database Seeder');
    console.log('════════════════════════════════════════\n');

    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅  Connected to MongoDB\n');

    // ── Clear existing records ───────────────────────────────────────────────
    console.log('🗑️   Clearing existing records...');

    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Bed.deleteMany({}),
      Admission.deleteMany({}),
      Appointment.deleteMany({}),
      LabOrder.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      MedicationTask.deleteMany({}),
      Vitals.deleteMany({}),
      NursingNote.deleteMany({}),
      RadiologyOrder.deleteMany({}),
    ]);

    console.log('    Done.\n');

    // ── Users ───────────────────────────────────────────────────────────────
    console.log('👤  Seeding users...');

    const users = [];

    for (const u of SEED_USERS) {
      const user = await User.create(u);
      users.push(user);
    }

    console.log(`    ✅ ${users.length} users seeded\n`);

    // ── Print user credentials table ────────────────────────────────────────
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                   LOGIN CREDENTIALS                     │');
    console.log('├───────────────────────────────┬─────────────────────────┤');
    console.log('│ Email                         │ Password                │');
    console.log('├───────────────────────────────┼─────────────────────────┤');

    for (const u of SEED_USERS) {
      const emailPad = u.email.padEnd(29);
      const passPad = u.password.padEnd(23);

      console.log(`│ ${emailPad} │ ${passPad} │`);
    }

    console.log('└───────────────────────────────┴─────────────────────────┘\n');

    // ── Patients ────────────────────────────────────────────────────────────
    console.log('🏥  Seeding patients...');

    const patients = await Patient.insertMany(SEED_PATIENTS);

    console.log(`    ✅ ${patients.length} patients seeded\n`);

    // ── Beds ─────────────────────────────────────────────────────────────────
    console.log('🛏️   Seeding ward beds...');

    const beds = await Bed.insertMany(SEED_BEDS);

    console.log(`    ✅ ${beds.length} beds seeded\n`);

    // ── Medication Tasks ──────────────────────────────────────────────────────
    console.log('💊  Seeding medication tasks...');
    const SEED_MEDICATION_TASKS = [
      { patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Telmisartan 40mg', dosage: '40mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now, givenBy: 'Nurse Station', notes: 'Administered post breakfast' },
      { patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Amlodipine 5mg', dosage: '5mg', route: 'Oral', scheduledTime: '08:00', status: 'Completed', completedAt: now, givenBy: 'Nurse Station', notes: '' },
      { patientId: 'P10025', patientName: 'Arun Kumar', ward: 'General Ward', bed: 'GW-04', medicine: 'Metformin 500mg', dosage: '500mg', route: 'Oral', scheduledTime: '13:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Give post lunch with water' },
      { patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Metoprolol 25mg', dosage: '25mg', route: 'Oral', scheduledTime: '09:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Check pulse rate before giving (<60 hold)' },
      { patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Furosemide 40mg', dosage: '40mg', route: 'IV Push', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Monitor urine output post injection' },
      { patientId: 'P10067', patientName: 'Rajesh Nair', ward: 'Cardiology ICU', bed: 'ICU-02', medicine: 'Nitroglycerin Patch 5mg', dosage: '5mg/24h', route: 'Transdermal', scheduledTime: '08:00', status: 'Completed', completedAt: now, givenBy: 'Nurse Station', notes: 'Applied on upper chest' },
      { patientId: 'P10041', patientName: 'Meena Devi', ward: 'Female Surgical Ward', bed: 'FSW-03', medicine: 'Ceftriaxone 1g', dosage: '1g', route: 'IV Infusion', scheduledTime: '12:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'Post-op prophylactic antibiotic' },
      { patientId: 'P10041', patientName: 'Meena Devi', ward: 'Female Surgical Ward', bed: 'FSW-03', medicine: 'Paracetamol 650mg', dosage: '650mg', route: 'Oral', scheduledTime: '14:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'For postoperative analgesia' },
      { patientId: 'P10089', patientName: 'Lakshmi Pillai', ward: 'Paediatric Ward', bed: 'PW-02', medicine: 'Paracetamol Syrup', dosage: '5ml (125mg)', route: 'Oral', scheduledTime: '13:00', status: 'Pending', completedAt: null, givenBy: null, notes: 'For fever (>100°F)' },
      { patientId: 'P10089', patientName: 'Lakshmi Pillai', ward: 'Paediatric Ward', bed: 'PW-02', medicine: 'Amoxicillin Syrup 250mg', dosage: '5ml', route: 'Oral', scheduledTime: '10:00', status: 'Completed', completedAt: now, givenBy: 'Nurse Station', notes: 'Given with milk' },
    ];
    const medTasks = await MedicationTask.insertMany(SEED_MEDICATION_TASKS);
    console.log(`    ✅ ${medTasks.length} medication tasks seeded\n`);

    // ── Vitals ────────────────────────────────────────────────────────────────
    console.log('❤️   Seeding vitals...');
    const SEED_VITALS = [
      { patientId: 'P10025', patientName: 'Arun Kumar', bp: '140/90', pulse: 78, temp: 98.6, spo2: 97, rr: 18, weight: 72, recordedBy: 'Nurse Station', notes: 'Post-morning round. BP elevated.', isCritical: false },
      { patientId: 'P10067', patientName: 'Rajesh Nair', bp: '85/55', pulse: 118, temp: 100.4, spo2: 89, rr: 26, weight: 68, recordedBy: 'ICU Nurse Station', notes: 'CRITICAL: Low SpO2 (89%) and tachycardia. O2 mask started.', isCritical: true },
      { patientId: 'P10041', patientName: 'Meena Devi', bp: '118/76', pulse: 80, temp: 98.8, spo2: 99, rr: 17, weight: 61, recordedBy: 'Surgical Nurse', notes: 'Surgical dressing clean and dry', isCritical: false },
      { patientId: 'P10089', patientName: 'Lakshmi Pillai', bp: '105/70', pulse: 110, temp: 101.1, spo2: 96, rr: 24, weight: 18, recordedBy: 'Paediatric Nurse', notes: 'Fever present. Cold sponge applied.', isCritical: false },
    ];
    const vitalsRecords = await Vitals.insertMany(SEED_VITALS);
    console.log(`    ✅ ${vitalsRecords.length} vitals seeded\n`);

    // ── Nursing Notes ─────────────────────────────────────────────────────────
    console.log('📝  Seeding nursing notes...');
    const SEED_NURSING_NOTES = [
      { patientId: 'P10067', patientName: 'Rajesh Nair', note: 'Patient experienced acute shortness of breath at 09:25. SpO2 dropped to 89%. Placed on high-flow O2. Dr. Kiran Reddy attended and adjusted IV diuretic dose.', shift: 'Morning', recordedBy: 'Head Nurse Station' },
      { patientId: 'P10025', patientName: 'Arun Kumar', note: 'Morning antihypertensives administered. Patient ambulating comfortably without dizziness.', shift: 'Morning', recordedBy: 'Staff Nurse' },
      { patientId: 'P10041', patientName: 'Meena Devi', note: 'Abdominal surgical wound site inspected. No redness or discharge noted. Foley catheter drained 450ml clear urine.', shift: 'Morning', recordedBy: 'Surgical Staff Nurse' },
      { patientId: 'P10089', patientName: 'Lakshmi Pillai', note: 'Child irritable due to fever (101.1°F). Oral syrup Paracetamol administered. Mother educated on fluid intake.', shift: 'Morning', recordedBy: 'Paediatric Nurse' },
    ];
    const nursingNotes = await NursingNote.insertMany(SEED_NURSING_NOTES);
    console.log(`    ✅ ${nursingNotes.length} nursing notes seeded\n`);

    // ── Radiology Orders ──────────────────────────────────────────────────────
    console.log('🔬  Seeding radiology orders...');
    const SEED_RADIOLOGY_ORDERS = [
      { orderId: 'RAD-2026-001', patientId: 'P10067', patientName: 'Rajesh Nair', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', modality: 'CT Scan', bodyPart: 'Chest', urgency: 'Urgent', status: 'In Progress', orderedDate: today, scheduledDate: today, scheduledTime: '11:30 AM', completedAt: null, report: null, impression: null, technician: 'Mr. Ravi T', radiologist: null, notes: 'Suspected pulmonary embolism — CT pulmonary angiography' },
      { orderId: 'RAD-2026-002', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'X-Ray', bodyPart: 'Chest', urgency: 'Routine', status: 'Verified', orderedDate: today, scheduledDate: today, scheduledTime: '10:00 AM', completedAt: today + 'T10:20:00', report: 'Cardiomegaly noted. Lung fields are clear. No consolidation or pleural effusion.', impression: 'Cardiomegaly. No active parenchymal lesion. Recommend echocardiography.', technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R', notes: 'Hypertensive patient — routine CXR' },
      { orderId: 'RAD-2026-003', patientId: 'P10041', patientName: 'Meena Devi', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'Ultrasound', bodyPart: 'Pelvis', urgency: 'Routine', status: 'Scan Completed', orderedDate: today, scheduledDate: today, scheduledTime: '01:30 PM', completedAt: today + 'T13:55:00', report: null, impression: null, technician: 'Mr. Kumar S', radiologist: null, notes: 'Post-operative pelvic assessment' },
      { orderId: 'RAD-2026-004', patientId: 'P10089', patientName: 'Lakshmi Pillai', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', modality: 'X-Ray', bodyPart: 'Chest', urgency: 'Routine', status: 'Ordered', orderedDate: today, scheduledDate: null, scheduledTime: null, completedAt: null, report: null, impression: null, technician: null, radiologist: null, notes: 'Paediatric fever workup — CXR to rule out pneumonia' },
      { orderId: 'RAD-2026-005', patientId: 'P10025', patientName: 'Arun Kumar', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', modality: 'Ultrasound', bodyPart: 'Kidney/Bladder', urgency: 'Routine', status: 'Verified', orderedDate: yest, scheduledDate: yest, scheduledTime: '11:00 AM', completedAt: yest + 'T11:40:00', report: 'Both kidneys normal in size and echogenicity. No hydronephrosis. No renal calculi.', impression: 'Normal renal ultrasound.', technician: 'Mr. Kumar S', radiologist: 'Dr. Vijay R', notes: 'Hypertension — renal artery doppler' },
      { orderId: 'RAD-2026-006', patientId: 'P10067', patientName: 'Rajesh Nair', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', modality: 'X-Ray', bodyPart: 'Chest', urgency: 'STAT', status: 'Verified', orderedDate: yest, scheduledDate: yest, scheduledTime: '09:15 AM', completedAt: yest + 'T09:30:00', report: 'Enlarged cardiac silhouette. Bilateral pulmonary edema with perihilar haziness. No pneumothorax.', impression: 'Pulmonary edema — consistent with cardiac failure. Immediate cardiology intervention.', technician: 'Mr. Ravi T', radiologist: 'Dr. Vijay R', notes: 'STAT CXR — suspected acute pulmonary oedema' },
    ];
    const radOrders = await RadiologyOrder.insertMany(SEED_RADIOLOGY_ORDERS);
    console.log(`    ✅ ${radOrders.length} radiology orders seeded\n`);


    // ── Audit Log ───────────────────────────────────────────────────────────
    // AuditLog requires userName and role.
    // Since this entry is generated automatically by the seed script,
    // identify it as a system operation.
    await AuditLog.create({
      userId: 'system',
      userName: 'System',
      role: 'system',
      action: 'SYSTEM_SEED',
      module: 'Administration',
      description:
        `Database seeded with ${users.length} users, ` +
        `${patients.length} patients, ` +
        `${beds.length} beds`,
      ipAddress: '127.0.0.1',
      status: 'Success',
    });

    console.log('════════════════════════════════════════');
    console.log('✅  Seeding complete! Database is ready.\n');

    await mongoose.connection.close();

    process.exit(0);

  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    console.error(err);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection close errors
    }

    process.exit(1);
  }
};

seed();