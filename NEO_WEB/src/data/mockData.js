// NEO-HMS Mock Data — Phase 1 (Extended for UI Redesign & 25+ records per section)

export const currentUser = {
  id: 'U001',
  name: 'Dr. Priya Sharma',
  role: 'Senior Physician',
  department: 'General Medicine',
  email: 'priya.sharma@neohms.in',
  avatar: null,
  initials: 'PS',
  status: 'online',
};

// Realistic pool of Indian patient names and details for consistency across mockData
const PATIENT_NAMES = [
  'Arun Kumar', 'Meena Devi', 'Rajesh Nair', 'Sunita Iyer', 'Prakash Nair',
  'Fatima Begum', 'Rajesh Varma', 'Deepa Thomas', 'Kavitha Rao', 'Mohammed Aslam',
  'Sunita Pillai', 'Ravi Shankar', 'Anil Deshmukh', 'Pooja Hegde', 'Suresh Menon',
  'Lakshmi Narayanan', 'Vikramaditya Roy', 'Geetha Krishnan', 'Manish Pandey', 'Sangeetha Reddi',
  'Harish Chandra', 'Divya Mukhopadhyay', 'Amitabh Saxena', 'Rohit Shetty', 'Farida Khan',
  'Venkat Raman', 'Aparna Sen', 'Tariq Ahmed', 'Bhavna Patel', 'Chetan Bhagat'
];

export const mockSearchResults = {
  patients: PATIENT_NAMES.slice(0, 25).map((name, i) => ({
    id: `P100${25 + i}`,
    name,
    age: 22 + ((i * 7) % 50),
    ward: ['General Ward', 'Maternity', 'Cardiology', 'ICU', 'Orthopedics', 'Neurology'][i % 6]
  })),
  appointments: Array.from({ length: 25 }, (_, i) => ({
    id: `APT10${24 + i}`,
    time: `${8 + (i % 9)}:${i % 2 === 0 ? '00' : '30'} ${i % 9 >= 4 ? 'PM' : 'AM'}`,
    patient: PATIENT_NAMES[i % PATIENT_NAMES.length],
    doctor: ['Dr. Priya Sharma', 'Dr. Kiran Rao', 'Dr. Ananya Menon', 'Dr. Rekha Singh', 'Dr. Suresh Bhat'][i % 5],
    status: ['Confirmed', 'Pending', 'In Consultation', 'Completed', 'Checked In'][i % 5]
  })),
  doctors: [
    { id: 'D001', name: 'Dr. Priya Sharma', dept: 'General Medicine' },
    { id: 'D002', name: 'Dr. Kiran Rao', dept: 'Cardiology' },
    { id: 'D003', name: 'Dr. Ananya Menon', dept: 'Neurology' },
    { id: 'D004', name: 'Dr. Rekha Singh', dept: 'Maternity & Gynaecology' },
    { id: 'D005', name: 'Dr. Suresh Bhat', dept: 'Orthopaedics' },
    { id: 'D006', name: 'Dr. Vikram Nair', dept: 'Paediatrics' },
    { id: 'D007', name: 'Dr. Leena Joseph', dept: 'Dermatology' },
    { id: 'D008', name: 'Dr. Arun Krishnan', dept: 'ENT' },
    { id: 'D009', name: 'Dr. Pooja Gupta', dept: 'Ophthalmology' },
    { id: 'D010', name: 'Dr. Rahul Mehta', dept: 'Emergency & Trauma' },
    { id: 'D011', name: 'Dr. Sanjay Dutt', dept: 'Urology' },
    { id: 'D012', name: 'Dr. Neha Kulkarni', dept: 'Psychiatry' },
    { id: 'D013', name: 'Dr. Alok Verma', dept: 'Pulmonology' },
    { id: 'D014', name: 'Dr. Shalini Das', dept: 'Endocrinology' },
    { id: 'D015', name: 'Dr. Rakesh Jhunjhun', dept: 'Gastroenterology' },
    { id: 'D016', name: 'Dr. Meera Nambiar', dept: 'Nephrology' },
    { id: 'D017', name: 'Dr. Siddharth Roy', dept: 'Oncology' },
    { id: 'D018', name: 'Dr. Farhan Akhtar', dept: 'Rheumatology' },
    { id: 'D019', name: 'Dr. Swati Banerjee', dept: 'Hematology' },
    { id: 'D020', name: 'Dr. Varun Dhawan', dept: 'Plastic Surgery' },
    { id: 'D021', name: 'Dr. Kirti Azad', dept: 'Vascular Surgery' },
    { id: 'D022', name: 'Dr. Vandana Luthra', dept: 'Pathology' },
    { id: 'D023', name: 'Dr. Arvind Swamy', dept: 'Microbiology' },
    { id: 'D024', name: 'Dr. Preeti Deshmukh', dept: 'Anesthesiology' },
    { id: 'D025', name: 'Dr. Tanmay Bhatt', dept: 'Radiology' }
  ],
  labOrders: Array.from({ length: 25 }, (_, i) => ({
    id: `LAB20${41 + i}`,
    test: ['CBC Panel', 'Lipid Profile', 'Troponin I', 'Liver Function', 'Urine Culture', 'Thyroid Profile', 'HbA1c', 'CT Scan'][i % 8],
    patient: `P100${25 + (i % 25)} – ${PATIENT_NAMES[i % PATIENT_NAMES.length]}`,
    status: ['Pending', 'Ready', 'Processing', 'Sample Collected'][i % 4]
  }))
};

export const mockNotifications = Array.from({ length: 25 }, (_, i) => {
  const types = ['lab', 'appointment', 'pharmacy', 'complaint', 'emergency', 'billing', 'nursing'];
  const titles = [
    'Lab Result Available', 'New Appointment Scheduled', 'Pharmacy Order Pending',
    'New Complaint Submitted', 'Emergency Admission', 'Invoice Issued', 'Vitals Alert'
  ];
  const type = types[i % types.length];
  return {
    id: `N0${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
    type,
    icon: type,
    title: titles[i % titles.length],
    message: `Activity notification #${i + 1} regarding Patient P100${25 + i} (${PATIENT_NAMES[i % PATIENT_NAMES.length]}).`,
    time: `${(i + 1) * 7} min ago`,
    read: i > 5
  };
});

// ── Dashboard KPI Stats (with trend data) ───────────────────
export const mockDashboardStats = [
  {
    id: 'S001',
    label: 'Total Patients',
    value: '1,284',
    sub: '+12 today',
    trend: 'up',
    trendPct: '4.2%',
    accent: '#2563EB',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    id: 'S002',
    label: 'Appointments Today',
    value: '87',
    sub: '14 pending',
    trend: 'up',
    trendPct: '8.7%',
    accent: '#0F766E',
    iconBg: '#CCFBF1',
    iconColor: '#0F766E',
  },
  {
    id: 'S003',
    label: 'Available Beds',
    value: '43',
    sub: '69 occupied',
    trend: 'down',
    trendPct: '3.1%',
    accent: '#16A34A',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    id: 'S004',
    label: 'Pending Tasks',
    value: '26',
    sub: '8 critical',
    trend: 'up',
    trendPct: '12.0%',
    accent: '#F59E0B',
    iconBg: '#FEF9C3',
    iconColor: '#F59E0B',
  },
];

// ── Today's Appointments (25 items) ──────────────────────────
export const mockTodayAppointments = Array.from({ length: 25 }, (_, i) => {
  const depts = ['Neurology', 'Cardiology', 'General Medicine', 'Maternity', 'Orthopedics', 'Paediatrics', 'Dermatology'];
  const doctors = ['Dr. Ananya Menon', 'Dr. Kiran Rao', 'Dr. Priya Sharma', 'Dr. Rekha Singh', 'Dr. Suresh Bhat', 'Dr. Vikram Nair'];
  const statuses = ['Completed', 'Completed', 'In Progress', 'Confirmed', 'Pending', 'Scheduled', 'Checked In'];
  const types = ['Consultation', 'Follow-up', 'New Patient', 'Review', 'Checkup'];
  const pName = PATIENT_NAMES[i % PATIENT_NAMES.length];
  const initials = pName.split(' ').map(n => n[0]).join('');
  const hour = 8 + Math.floor(i / 2);
  const min = (i % 2) * 30;
  const timeStr = `${hour < 10 ? '0' + hour : hour}:${min === 0 ? '00' : min}`;

  return {
    id: `APT10${20 + i}`,
    time: timeStr,
    patient: pName,
    patientId: `P100${18 + i}`,
    initials,
    doctor: doctors[i % doctors.length],
    dept: depts[i % depts.length],
    status: statuses[i % statuses.length],
    type: types[i % types.length]
  };
});

// ── Active Admissions (IPD - 25 items) ───────────────────────
export const mockActiveAdmissions = Array.from({ length: 25 }, (_, i) => {
  const wards = ['General Ward', 'Cardiology', 'Neurology', 'Maternity', 'Orthopedics', 'Emergency', 'ICU'];
  const doctors = ['Dr. Priya Sharma', 'Dr. Kiran Rao', 'Dr. Ananya Menon', 'Dr. Rekha Singh', 'Dr. Suresh Bhat'];
  const conditions = ['Stable', 'Serious', 'Stable', 'Stable', 'Recovering', 'Critical'];
  const diagnoses = ['Hypertension', 'AMI – Post-Stent', 'Migraine – Acute', 'Labour – Active', 'Post Hip Replacement', 'Acute Abdomen', 'Severe Pneumonia'];
  const pName = PATIENT_NAMES[i % PATIENT_NAMES.length];
  const initials = pName.split(' ').map(n => n[0]).join('');

  return {
    id: `ADM${i + 1 < 10 ? '00' + (i + 1) : '0' + (i + 1)}`,
    patient: pName,
    patientId: `P100${25 + i}`,
    initials,
    bed: `${wards[i % wards.length].slice(0, 3).toUpperCase()}-0${(i % 9) + 1}`,
    ward: wards[i % wards.length],
    admitDate: `${10 + (i % 8)} Aug`,
    days: (i % 5) + 1,
    condition: conditions[i % conditions.length],
    doctor: doctors[i % doctors.length],
    diagnosis: diagnoses[i % diagnoses.length]
  };
});

// ── Department Overview ──────────────────────────────────────
export const mockDepartments = [
  { name: 'General Medicine', patients: 48, occupancy: 82, beds: 60, available: 12, onCall: 'Dr. Priya Sharma', status: 'normal' },
  { name: 'Cardiology', patients: 31, occupancy: 75, beds: 40, available: 10, onCall: 'Dr. Kiran Rao', status: 'normal' },
  { name: 'Neurology', patients: 22, occupancy: 61, beds: 36, available: 14, onCall: 'Dr. Ananya Menon', status: 'normal' },
  { name: 'Maternity', patients: 18, occupancy: 90, beds: 20, available: 2, onCall: 'Dr. Rekha Singh', status: 'warning' },
  { name: 'Orthopedics', patients: 27, occupancy: 68, beds: 40, available: 13, onCall: 'Dr. Suresh Bhat', status: 'normal' },
  { name: 'Emergency', patients: 6, occupancy: 55, beds: 10, available: 4, onCall: 'Dr. Priya Sharma', status: 'normal' },
  { name: 'Paediatrics', patients: 15, occupancy: 50, beds: 30, available: 15, onCall: 'Dr. Vikram Nair', status: 'normal' },
  { name: 'Dermatology', patients: 12, occupancy: 40, beds: 15, available: 9, onCall: 'Dr. Leena Joseph', status: 'normal' },
  { name: 'ENT', patients: 14, occupancy: 56, beds: 25, available: 11, onCall: 'Dr. Arun Krishnan', status: 'normal' },
  { name: 'Ophthalmology', patients: 19, occupancy: 63, beds: 30, available: 11, onCall: 'Dr. Pooja Gupta', status: 'normal' },
  { name: 'Urology', patients: 16, occupancy: 64, beds: 25, available: 9, onCall: 'Dr. Sanjay Dutt', status: 'normal' },
  { name: 'Psychiatry', patients: 10, occupancy: 50, beds: 20, available: 10, onCall: 'Dr. Neha Kulkarni', status: 'normal' },
  { name: 'Pulmonology', patients: 25, occupancy: 83, beds: 30, available: 5, onCall: 'Dr. Alok Verma', status: 'normal' },
  { name: 'Nephrology', patients: 21, occupancy: 70, beds: 30, available: 9, onCall: 'Dr. Meera Nambiar', status: 'normal' },
  { name: 'Oncology', patients: 28, occupancy: 93, beds: 30, available: 2, onCall: 'Dr. Siddharth Roy', status: 'warning' }
];

// ── Pending Clinical Tasks (25 items) ─────────────────────────
export const mockPendingTasks = Array.from({ length: 25 }, (_, i) => {
  const priorities = ['critical', 'high', 'high', 'medium', 'medium', 'low'];
  const modules = ['Lab', 'IPD', 'Pharmacy', 'Surgery', 'Billing', 'OPD', 'Nursing'];
  const assignees = ['Dr. Priya Sharma', 'Dr. Kiran Rao', 'Dr. Suresh Bhat', 'Admin', 'Reception', 'Nurse Mary'];
  const pName = PATIENT_NAMES[i % PATIENT_NAMES.length];

  return {
    id: `T0${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
    priority: priorities[i % priorities.length],
    text: `Task #${i + 1}: Clinical review for P100${25 + i} – ${pName}`,
    module: modules[i % modules.length],
    time: `${08 + (i % 9)}:${(i * 5) % 60 < 10 ? '0' + ((i * 5) % 60) : (i * 5) % 60} AM`,
    assignee: assignees[i % assignees.length]
  };
});

// ── Pending Lab Orders (25 items) ────────────────────────────
export const mockPendingLabOrders = Array.from({ length: 25 }, (_, i) => {
  const tests = ['CBC Panel', 'Lipid Profile', 'Troponin I', 'Urine Culture', 'CT Brain', 'Liver Function', 'Thyroid Profile', 'HbA1c', 'D-Dimer'];
  const statuses = ['Ready', 'Processing', 'Processing', 'Pending', 'Pending'];
  const urgencies = ['routine', 'stat', 'stat', 'routine', 'urgent'];
  const pName = PATIENT_NAMES[i % PATIENT_NAMES.length];

  return {
    id: `LAB20${39 + i}`,
    test: tests[i % tests.length],
    patient: pName,
    patientId: `P100${25 + i}`,
    ordered: `0${8 + (i % 4)}:${(i * 12) % 60 < 10 ? '0' + ((i * 12) % 60) : (i * 12) % 60} AM`,
    status: statuses[i % statuses.length],
    urgency: urgencies[i % urgencies.length]
  };
});

// ── Critical Alerts (15 items) ──────────────────────────────
export const mockCriticalAlerts = Array.from({ length: 15 }, (_, i) => {
  const types = ['critical', 'warning', 'info'];
  const texts = [
    `ICU Bed E-0${(i % 9) + 1} — Patient ${PATIENT_NAMES[i % PATIENT_NAMES.length]}: BP 80/50, requires immediate attention`,
    `Ward ${i + 1}A at 90% capacity — limited bed availability`,
    `Code Blue emergency drill scheduled for today at ${14 + (i % 3)}:00`,
    `Pharmacy stock low for Injection Ondansetron & Ceftriaxone`,
    `Lab report pending urgent verification for P100${25 + i}`
  ];
  return {
    id: `ALT0${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
    type: types[i % types.length],
    text: texts[i % texts.length],
    time: `${10 + (i % 3)}:${(i * 7) % 60 < 10 ? '0' + ((i * 7) % 60) : (i * 7) % 60} AM`
  };
});

// ── Recent Activity Feed (25 items) ──────────────────────────
export const mockActivities = Array.from({ length: 25 }, (_, i) => {
  const types = ['admission', 'lab', 'discharge', 'pharmacy', 'appointment', 'emergency', 'radiology'];
  const users = ['Reception', 'Lab Dept', 'Dr. Priya Sharma', 'Pharmacy', 'Dr. Kiran Rao', 'Emergency Dept', 'Radiology'];
  const pName = PATIENT_NAMES[i % PATIENT_NAMES.length];

  return {
    id: `A0${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
    type: types[i % types.length],
    text: `Activity #${i + 1}: Record update completed for P100${25 + i} (${pName})`,
    time: `${08 + (i % 5)}:${(i * 4) % 60 < 10 ? '0' + ((i * 4) % 60) : (i * 4) % 60} AM`,
    user: users[i % users.length]
  };
});

// ── Hospital Shift Info ──────────────────────────────────────
export const mockShiftInfo = {
  shift: 'Morning',
  shiftStart: '08:00',
  shiftEnd: '16:00',
  census: {
    totalInpatients: 184,
    admittedToday: 18,
    dischargedToday: 12,
    scheduledDischarges: 15,
    pendingAdmissions: 14,
    occupancyPct: 78,
  },
};
