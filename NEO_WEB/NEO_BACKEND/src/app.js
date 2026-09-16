const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ─── Auth & Core ──────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const patientRoutes     = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const auditRoutes       = require('./routes/audit.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');

// ─── Clinical ─────────────────────────────────────────────────────────────────
const consultationRoutes = require('./routes/consultation.routes');
const doctorRoutes       = require('./routes/doctor.routes');
const laboratoryRoutes   = require('./routes/laboratory.routes');
const radiologyRoutes    = require('./routes/radiology.routes');
const pharmacyRoutes     = require('./routes/pharmacy.routes');
const nursingRoutes      = require('./routes/nursing.routes');
const ipdRoutes          = require('./routes/ipd.routes');
const emergencyRoutes    = require('./routes/emergency.routes');
const surgeryRoutes      = require('./routes/surgery.routes');

// ─── Finance & Insurance ──────────────────────────────────────────────────────
const billingRoutes      = require('./routes/billing.routes');
const insuranceRoutes    = require('./routes/insurance.routes');

// ─── Support Modules ──────────────────────────────────────────────────────────
const bloodBankRoutes    = require('./routes/bloodBank.routes');
const dischargeRoutes    = require('./routes/discharge.routes');
const followupRoutes     = require('./routes/followup.routes');
const complaintRoutes    = require('./routes/complaint.routes');

// ─── Administration ───────────────────────────────────────────────────────────
const departmentRoutes     = require('./routes/department.routes');
const staffRoutes          = require('./routes/staff.routes');
const notificationRoutes   = require('./routes/notification.routes');
const settingsRoutes       = require('./routes/settings.routes');
const reportRoutes         = require('./routes/report.routes');

// ─── Analytics & Records ──────────────────────────────────────────────────────
const emrRoutes            = require('./routes/emr.routes');
const traceabilityRoutes   = require('./routes/traceability.routes');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'NEO-HMS',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Auth & Core Routes ───────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/audit',        auditRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ─── Clinical Routes ──────────────────────────────────────────────────────────
app.use('/api/consultations', consultationRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/laboratory',    laboratoryRoutes);
app.use('/api/radiology',     radiologyRoutes);
app.use('/api/pharmacy',      pharmacyRoutes);
app.use('/api/nursing',       nursingRoutes);
app.use('/api/ipd',           ipdRoutes);
app.use('/api/emergency',     emergencyRoutes);
app.use('/api/surgery',       surgeryRoutes);

// ─── Finance Routes ───────────────────────────────────────────────────────────
app.use('/api/billing',       billingRoutes);
app.use('/api/insurance',     insuranceRoutes);

// ─── Support Routes ───────────────────────────────────────────────────────────
app.use('/api/blood-bank',   bloodBankRoutes);
app.use('/api/discharges',   dischargeRoutes);
app.use('/api/followups',    followupRoutes);
app.use('/api/complaints',   complaintRoutes);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.use('/api/departments',    departmentRoutes);
app.use('/api/staff',          staffRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/settings',       settingsRoutes);
app.use('/api/reports',        reportRoutes);

// ─── Records & Analytics ──────────────────────────────────────────────────────
app.use('/api/emr',            emrRoutes);
app.use('/api/traceability',   traceabilityRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
