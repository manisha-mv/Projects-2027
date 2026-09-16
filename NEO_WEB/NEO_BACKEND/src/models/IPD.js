// src/models/IPD.js
const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedId: { type: String, unique: true, required: true, index: true },
    ward: { type: String, required: true, index: true },
    type: { type: String, default: 'Standard' },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
      default: 'Available',
      index: true,
    },
    patientId: { type: String, default: null },
    patientName: { type: String, default: null },
  },
  { timestamps: true }
);

const admissionSchema = new mongoose.Schema(
  {
    admissionId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    bedId: { type: String, required: true, index: true },
    ward: { type: String, required: true },
    admitDate: { type: String, required: true },
    admitTime: { type: String, default: '08:00' },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    nurseAssigned: { type: String, default: 'Nurse' },
    status: { type: String, enum: ['Active', 'Discharged', 'Transferred'], default: 'Active', index: true },
    condition: { type: String, enum: ['Stable', 'Serious', 'Critical', 'Recovering'], default: 'Stable' },
    dischargeDate: { type: String, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Bed = mongoose.model('Bed', bedSchema);
const Admission = mongoose.model('Admission', admissionSchema);

module.exports = { Bed, Admission };
