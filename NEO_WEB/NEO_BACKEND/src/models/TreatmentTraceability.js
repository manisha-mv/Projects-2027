// src/models/TreatmentTraceability.js
const mongoose = require('mongoose');

const EVENT_TYPES = [
  'PATIENT_REGISTERED',
  'APPOINTMENT_CREATED',
  'CHECK_IN',
  'CONSULTATION_STARTED',
  'CONSULTATION_COMPLETED',
  'LAB_ORDERED',
  'SAMPLE_COLLECTED',
  'LAB_RESULT_ENTERED',
  'LAB_RESULT_VERIFIED',
  'RADIOLOGY_ORDERED',
  'RADIOLOGY_COMPLETED',
  'PRESCRIPTION_CREATED',
  'MEDICINE_DISPENSED',
  'ADMISSION_CREATED',
  'BED_ASSIGNED',
  'NURSING_ACTIVITY',
  'PROCEDURE_COMPLETED',
  'BILL_CREATED',
  'PAYMENT_COMPLETED',
  'DISCHARGE_CREATED',
  'FOLLOWUP_CREATED',
  'COMPLAINT_CREATED',
  // User-friendly UI strings
  'Registration',
  'Appointment',
  'Check-In',
  'Consultation',
  'Lab Order',
  'Lab Result',
  'Radiology Order',
  'Radiology Report',
  'Prescription',
  'Pharmacy Dispense',
  'Admission',
  'Nursing Care',
  'Vitals Recorded',
  'Procedure',
  'Surgery',
  'Billing',
  'Discharge',
  'Follow-Up',
];

const treatmentTraceabilitySchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    performedBy: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    time: {
      type: String,
      default: () => new Date().toTimeString().slice(0, 5),
    },
    status: {
      type: String,
      default: 'Completed',
    },
    relatedId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

treatmentTraceabilitySchema.index({ patientId: 1, createdAt: 1 });

const TreatmentTraceability = mongoose.model('TreatmentTraceability', treatmentTraceabilitySchema);
module.exports = TreatmentTraceability;
module.exports.EVENT_TYPES = EVENT_TYPES;
