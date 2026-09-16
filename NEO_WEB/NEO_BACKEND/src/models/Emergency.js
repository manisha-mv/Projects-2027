// src/models/Emergency.js
const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    emergencyId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, default: null, index: true },
    patientName: { type: String, required: true },
    age: { type: Number, default: 0 },
    gender: { type: String, default: 'Male' },
    phone: { type: String, default: null },
    arrivalTime: { type: Date, default: Date.now },
    chiefComplaint: { type: String, required: true },
    triage: {
      type: String,
      enum: ['P1 - Critical', 'P2 - Urgent', 'P3 - Semi-Urgent', 'P4 - Non-Urgent', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'P1 - Critical',
      index: true,
    },
    status: {
      type: String,
      enum: ['Registered', 'Triaged', 'Under Treatment', 'Admitted', 'Discharged', 'Referred', 'Expired'],
      default: 'Registered',
      index: true,
    },
    assignedDoctor: { type: String, default: 'Emergency Doctor' },
    bedId: { type: String, default: null },
    treatment: { type: String, default: '' },
    admittedAt: { type: Date, default: null },
    dischargedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Emergency = mongoose.model('Emergency', emergencySchema);
module.exports = Emergency;
