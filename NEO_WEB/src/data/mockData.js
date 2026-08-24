// NEO-HMS Mock Data — Phase 1 (Extended for UI Redesign)

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

export const mockSearchResults = {
  patients: [
    { id: 'P10025', name: 'Arun Kumar',  age: 42, ward: 'General Ward' },
    { id: 'P10041', name: 'Meena Devi',  age: 35, ward: 'Maternity' },
    { id: 'P10067', name: 'Rajesh Nair', age: 58, ward: 'Cardiology' },
  ],
  appointments: [
    { id: 'APT1024', time: '10:30 AM', patient: 'Arun Kumar',   doctor: 'Dr. Priya Sharma', status: 'Confirmed' },
    { id: 'APT1025', time: '11:00 AM', patient: 'Meena Devi',   doctor: 'Dr. Kiran Rao',    status: 'Pending' },
  ],
  doctors: [
    { id: 'D001', name: 'Dr. Priya Sharma',   dept: 'General Medicine' },
    { id: 'D002', name: 'Dr. Kiran Rao',       dept: 'Cardiology' },
    { id: 'D003', name: 'Dr. Ananya Menon',    dept: 'Neurology' },
  ],
  labOrders: [
    { id: 'LAB2041', test: 'CBC Panel',     patient: 'P10025 – Arun Kumar', status: 'Pending' },
    { id: 'LAB2042', test: 'Lipid Profile', patient: 'P10067 – Rajesh Nair', status: 'Ready' },
  ],
};

export const mockNotifications = [
  {
    id: 'N001',
    type: 'lab',
    icon: 'lab',
    title: 'Lab Result Available',
    message: 'CBC Panel result is ready for Patient P10025 – Arun Kumar.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'N002',
    type: 'appointment',
    icon: 'appointment',
    title: 'New Appointment Scheduled',
    message: 'APT1026 – Dr. Kiran Rao at 2:00 PM with Sunita Pillai.',
    time: '18 min ago',
    read: false,
  },
  {
    id: 'N003',
    type: 'pharmacy',
    icon: 'pharmacy',
    title: 'Pharmacy Order Pending',
    message: 'Order ORD3081 awaiting approval for Patient P10041.',
    time: '42 min ago',
    read: false,
  },
  {
    id: 'N004',
    type: 'complaint',
    icon: 'complaint',
    title: 'New Complaint Submitted',
    message: 'Complaint #C-204 submitted regarding Ward 3B facilities.',
    time: '1 hr ago',
    read: true,
  },
  {
    id: 'N005',
    type: 'emergency',
    icon: 'emergency',
    title: 'Emergency Admission',
    message: 'New emergency patient admitted – Bed E-07 assigned.',
    time: '2 hr ago',
    read: true,
  },
];

// ── Dashboard KPI Stats (with trend data) ───────────────────
export const mockDashboardStats = [
  {
    id: 'S001',
    label: 'Total Patients',
    value: '1,284',
    sub: '+12 today',
    trend: 'up',
    trendPct: '4.2%',
    accent: '#0F52BA',
    iconBg: '#E6EEF9',
    iconColor: '#0F52BA',
  },
  {
    id: 'S002',
    label: 'Appointments Today',
    value: '87',
    sub: '14 pending',
    trend: 'up',
    trendPct: '8.7%',
    accent: '#0B9488',
    iconBg: '#E6F4F3',
    iconColor: '#0B9488',
  },
  {
    id: 'S003',
    label: 'Available Beds',
    value: '43',
    sub: '69 occupied',
    trend: 'down',
    trendPct: '3.1%',
    accent: '#059669',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
  },
  {
    id: 'S004',
    label: 'Pending Tasks',
    value: '26',
    sub: '8 critical',
    trend: 'up',
    trendPct: '12.0%',
    accent: '#D97706',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
];

// ── Today's Appointments ─────────────────────────────────────
export const mockTodayAppointments = [
  { id: 'APT1020', time: '09:00', patient: 'Karthik Suresh',  patientId: 'P10018', initials: 'KS', doctor: 'Dr. Ananya Menon',  dept: 'Neurology',     status: 'Completed',   type: 'Consultation' },
  { id: 'APT1021', time: '09:30', patient: 'Lalitha Iyer',    patientId: 'P10031', initials: 'LI', doctor: 'Dr. Kiran Rao',    dept: 'Cardiology',    status: 'Completed',   type: 'Follow-up' },
  { id: 'APT1022', time: '10:00', patient: 'Mohammed Aslam',  patientId: 'P10052', initials: 'MA', doctor: 'Dr. Priya Sharma', dept: 'Gen. Medicine', status: 'In Progress', type: 'New Patient' },
  { id: 'APT1023', time: '10:30', patient: 'Arun Kumar',      patientId: 'P10025', initials: 'AK', doctor: 'Dr. Priya Sharma', dept: 'Gen. Medicine', status: 'Confirmed',   type: 'Follow-up' },
  { id: 'APT1024', time: '11:00', patient: 'Meena Devi',      patientId: 'P10041', initials: 'MD', doctor: 'Dr. Kiran Rao',    dept: 'Cardiology',    status: 'Pending',     type: 'Consultation' },
  { id: 'APT1025', time: '11:30', patient: 'Sunita Pillai',   patientId: 'P10060', initials: 'SP', doctor: 'Dr. Ananya Menon', dept: 'Neurology',     status: 'Confirmed',   type: 'Review' },
  { id: 'APT1026', time: '14:00', patient: 'Ravi Shankar',    patientId: 'P10071', initials: 'RS', doctor: 'Dr. Kiran Rao',    dept: 'Cardiology',    status: 'Pending',     type: 'Consultation' },
];

// ── Active Admissions (IPD) ──────────────────────────────────
export const mockActiveAdmissions = [
  { id: 'ADM001', patient: 'Arun Kumar',      patientId: 'P10025', initials: 'AK', bed: 'GW-04', ward: 'General Ward',    admitDate: '14 Aug', days: 2,  condition: 'Stable',   doctor: 'Dr. Priya Sharma', diagnosis: 'Hypertension' },
  { id: 'ADM002', patient: 'Sunita Iyer',     patientId: 'P10033', initials: 'SI', bed: 'CAR-02', ward: 'Cardiology',     admitDate: '13 Aug', days: 3,  condition: 'Serious',  doctor: 'Dr. Kiran Rao',    diagnosis: 'AMI – Post-Stent' },
  { id: 'ADM003', patient: 'Prakash Nair',    patientId: 'P10047', initials: 'PN', bed: 'NEU-07', ward: 'Neurology',      admitDate: '15 Aug', days: 1,  condition: 'Stable',   doctor: 'Dr. Ananya Menon', diagnosis: 'Migraine – Acute' },
  { id: 'ADM004', patient: 'Fatima Begum',    patientId: 'P10055', initials: 'FB', bed: 'MAT-03', ward: 'Maternity',      admitDate: '16 Aug', days: 0,  condition: 'Stable',   doctor: 'Dr. Rekha Singh',  diagnosis: 'Labour – Active' },
  { id: 'ADM005', patient: 'Rajesh Varma',    patientId: 'P10062', initials: 'RV', bed: 'ORT-11', ward: 'Orthopedics',    admitDate: '12 Aug', days: 4,  condition: 'Recovering', doctor: 'Dr. Suresh Bhat', diagnosis: 'Post Hip Replacement' },
  { id: 'ADM006', patient: 'Deepa Thomas',    patientId: 'P10069', initials: 'DT', bed: 'E-07',   ward: 'Emergency',      admitDate: '16 Aug', days: 0,  condition: 'Critical', doctor: 'Dr. Priya Sharma', diagnosis: 'Acute Abdomen' },
];

// ── Department Overview ──────────────────────────────────────
export const mockDepartments = [
  { name: 'General Medicine', patients: 48, occupancy: 82, beds: 60,  available: 12, onCall: 'Dr. Priya Sharma',  status: 'normal' },
  { name: 'Cardiology',       patients: 31, occupancy: 75, beds: 40,  available: 10, onCall: 'Dr. Kiran Rao',    status: 'normal' },
  { name: 'Neurology',        patients: 22, occupancy: 61, beds: 36,  available: 14, onCall: 'Dr. Ananya Menon', status: 'normal' },
  { name: 'Maternity',        patients: 18, occupancy: 90, beds: 20,  available: 2,  onCall: 'Dr. Rekha Singh',  status: 'warning' },
  { name: 'Orthopedics',      patients: 27, occupancy: 68, beds: 40,  available: 13, onCall: 'Dr. Suresh Bhat',  status: 'normal' },
  { name: 'Emergency',        patients: 6,  occupancy: 55, beds: 10,  available: 4,  onCall: 'Dr. Priya Sharma', status: 'normal' },
];

// ── Pending Clinical Tasks ───────────────────────────────────
export const mockPendingTasks = [
  { id: 'T001', priority: 'critical', text: 'Review CBC results for P10025 – Arun Kumar', module: 'Lab',        time: '10:05 AM', assignee: 'Dr. Priya Sharma' },
  { id: 'T002', priority: 'high',     text: 'Discharge clearance for P10011 – Kavitha Rao', module: 'IPD',     time: '10:30 AM', assignee: 'Dr. Priya Sharma' },
  { id: 'T003', priority: 'high',     text: 'Approve pharmacy order ORD3081 – P10041',      module: 'Pharmacy', time: '09:55 AM', assignee: 'Dr. Kiran Rao' },
  { id: 'T004', priority: 'medium',   text: 'Update surgery notes – P10062 Rajesh Varma',   module: 'Surgery',  time: '11:00 AM', assignee: 'Dr. Suresh Bhat' },
  { id: 'T005', priority: 'medium',   text: 'Confirm insurance auth – P10033 Sunita Iyer',  module: 'Billing',  time: '12:00 PM', assignee: 'Admin' },
  { id: 'T006', priority: 'low',      text: 'Consent form pending – APT1026 Ravi Shankar',  module: 'OPD',      time: '14:00 PM', assignee: 'Reception' },
];

// ── Pending Lab Orders ───────────────────────────────────────
export const mockPendingLabOrders = [
  { id: 'LAB2039', test: 'CBC Panel',      patient: 'Arun Kumar',   patientId: 'P10025', ordered: '09:15 AM', status: 'Ready',      urgency: 'routine' },
  { id: 'LAB2040', test: 'Lipid Profile',  patient: 'Sunita Iyer',  patientId: 'P10033', ordered: '08:50 AM', status: 'Processing', urgency: 'stat' },
  { id: 'LAB2041', test: 'Troponin I',     patient: 'Sunita Iyer',  patientId: 'P10033', ordered: '08:52 AM', status: 'Processing', urgency: 'stat' },
  { id: 'LAB2042', test: 'Urine Culture',  patient: 'Meena Devi',   patientId: 'P10041', ordered: '10:00 AM', status: 'Pending',    urgency: 'routine' },
  { id: 'LAB2043', test: 'CT Brain',       patient: 'Prakash Nair', patientId: 'P10047', ordered: '09:45 AM', status: 'Pending',    urgency: 'urgent' },
];

// ── Critical Alerts ──────────────────────────────────────────
export const mockCriticalAlerts = [
  { id: 'ALT001', type: 'critical', text: 'ICU Bed E-07 — Patient Deepa Thomas: BP 80/50, requires immediate attention', time: '10:31 AM' },
  { id: 'ALT002', type: 'warning',  text: 'Maternity Ward 90% full — only 2 beds remaining', time: '10:15 AM' },
  { id: 'ALT003', type: 'info',     text: 'Code Blue drill scheduled at 14:00 — all staff to comply', time: '09:00 AM' },
];

// ── Recent Activity Feed ─────────────────────────────────────
export const mockActivities = [
  { id: 'A001', type: 'admission',   text: 'P10025 Arun Kumar admitted to General Ward (Bed GW-04)',          time: '10:22 AM', user: 'Reception' },
  { id: 'A002', type: 'lab',         text: 'Lab result LAB2039 (CBC Panel) ready — awaiting Dr. Sharma',      time: '09:58 AM', user: 'Lab Dept' },
  { id: 'A003', type: 'discharge',   text: 'P10011 Kavitha Rao discharged from Ward 2A — clearance issued',   time: '09:30 AM', user: 'Dr. Priya Sharma' },
  { id: 'A004', type: 'pharmacy',    text: 'Prescription ORD3078 dispensed for P10052 Mohammed Aslam',        time: '09:14 AM', user: 'Pharmacy' },
  { id: 'A005', type: 'appointment', text: 'APT1019 — Dr. Kiran Rao consultation completed with P10031',      time: '08:47 AM', user: 'Dr. Kiran Rao' },
  { id: 'A006', type: 'emergency',   text: 'P10069 Deepa Thomas registered as Emergency — Bed E-07 assigned', time: '08:30 AM', user: 'Emergency Dept' },
  { id: 'A007', type: 'lab',         text: 'Radiology report RD-0091 finalized for P10047 Prakash Nair',      time: '08:10 AM', user: 'Radiology' },
];

// ── Hospital Shift Info ──────────────────────────────────────
export const mockShiftInfo = {
  shift: 'Morning',
  shiftStart: '08:00',
  shiftEnd: '16:00',
  census: {
    totalInpatients: 112,
    admittedToday: 6,
    dischargedToday: 3,
    scheduledDischarges: 5,
    pendingAdmissions: 4,
    occupancyPct: 62,
  },
};
