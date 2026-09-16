// src/models/Appointment.js
const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'Waiting',
  'In Consultation',
  'Completed',
  'Cancelled',
  'No Show',
  // Uppercase aliases
  'SCHEDULED',
  'CHECKED_IN',
  'WAITING',
  'IN_CONSULTATION',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    department: { type: String, required: true, index: true },
    appointmentDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true },
    type: {
      type: String,
      enum: ['New Visit', 'Follow-up', 'Emergency', 'Teleconsultation'],
      default: 'New Visit',
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'Scheduled',
      index: true,
    },
    chiefComplaint: { type: String, default: '' },
    notes: { type: String, default: '' },
    checkinTime: { type: Date, default: null },
    consultationStartTime: { type: Date, default: null },
    consultationEndTime: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ appointmentDate: 1, doctorId: 1, timeSlot: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
