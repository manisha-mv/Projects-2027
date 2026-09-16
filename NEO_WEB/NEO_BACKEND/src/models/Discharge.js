// src/models/Discharge.js
const mongoose = require('mongoose');

const dischargeSchema = new mongoose.Schema(
  {
    dischargeId: { type: String, unique: true, required: true, index: true },
    admissionId: { type: String, default: null },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    ward: { type: String, default: '' },
    bed: { type: String, default: '' },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending', index: true },
    scheduledDate: { type: String, required: true },
    actualDischargeDate: { type: String, default: null },
    diagnosis: { type: String, required: true },
    treatment: { type: String, default: '' },
    dischargeType: { type: String, default: 'Regular' },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
    instructions: { type: String, default: '' },
    followUpDate: { type: String, default: null },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

const Discharge = mongoose.model('Discharge', dischargeSchema);
module.exports = Discharge;
