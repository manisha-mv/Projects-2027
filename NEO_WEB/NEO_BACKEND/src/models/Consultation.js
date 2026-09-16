// src/models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    consultationId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    appointmentId: { type: String, default: null },
    department: { type: String, required: true },
    symptoms: [String],
    vitals: {
      bp: String,
      pulse: Number,
      temp: Number,
      spo2: Number,
      rr: Number,
      weight: Number,
      height: Number,
    },
    examination: { type: String, default: '' },
    diagnosis: { type: String, required: true },
    clinicalNotes: { type: String, default: '' },
    treatmentPlan: { type: String, default: '' },
    labOrders: [{ testName: String, urgency: String, notes: String }],
    radiologyOrders: [{ modality: String, bodyPart: String, urgency: String, notes: String }],
    prescriptions: [{ medicineName: String, dosage: String, frequency: String, duration: String, quantity: Number }],
    followUpDate: { type: String, default: null },
    status: { type: String, enum: ['In Progress', 'Completed', 'Cancelled'], default: 'Completed' },
  },
  { timestamps: true }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;
