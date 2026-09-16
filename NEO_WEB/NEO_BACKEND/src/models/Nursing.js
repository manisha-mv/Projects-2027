// src/models/Nursing.js
const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    bp: { type: String, default: '' },
    pulse: { type: Number, default: null },
    temp: { type: Number, default: null },
    spo2: { type: Number, default: null },
    rr: { type: Number, default: null },
    weight: { type: Number, default: null },
    notes: { type: String, default: '' },
    isCritical: { type: Boolean, default: false },
    recordedBy: { type: String, default: 'Nurse' },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const nursingNoteSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    note: { type: String, required: true },
    shift: { type: String, default: 'Morning' },
    recordedBy: { type: String, default: 'Nurse' },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const medicationTaskSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    ward: { type: String, default: '' },
    bed: { type: String, default: '' },
    medicine: { type: String, required: true },
    dosage: { type: String, default: '' },
    route: { type: String, default: 'Oral' },
    scheduledTime: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Skipped'], default: 'Pending' },
    completedAt: { type: Date, default: null },
    givenBy: { type: String, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Vitals = mongoose.model('Vitals', vitalsSchema);
const NursingNote = mongoose.model('NursingNote', nursingNoteSchema);
const MedicationTask = mongoose.model('MedicationTask', medicationTaskSchema);

module.exports = { Vitals, NursingNote, MedicationTask };
