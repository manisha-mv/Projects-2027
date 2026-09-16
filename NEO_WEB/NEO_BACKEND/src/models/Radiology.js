// src/models/Radiology.js
const mongoose = require('mongoose');

const RADIOLOGY_STATUSES = [
  'Ordered',
  'Scheduled',
  'In Progress',
  'Scan Completed',
  'Report Entered',
  'Verified',
  'Completed',
  'Cancelled',
  // Uppercase aliases
  'ORDERED',
  'SCHEDULED',
  'IN_PROGRESS',
  'REPORT_ENTERED',
  'VERIFIED',
  'COMPLETED',
];

const radiologyOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    modality: {
      type: String,
      enum: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Echocardiography', 'PET Scan', 'Mammography', 'Fluoroscopy', 'DEXA Scan', 'X-RAY', 'CT', 'OTHER'],
      required: true,
    },
    bodyPart: { type: String, required: true },
    urgency: { type: String, enum: ['Routine', 'Urgent', 'STAT'], default: 'Routine' },
    status: { type: String, enum: RADIOLOGY_STATUSES, default: 'Ordered', index: true },
    orderedDate: { type: String, required: true },
    scheduledDate: { type: String, default: null },
    scheduledTime: { type: String, default: null },
    completedAt: { type: Date, default: null },
    report: { type: String, default: null },
    impression: { type: String, default: null },
    technician: { type: String, default: null },
    radiologist: { type: String, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const RadiologyOrder = mongoose.model('RadiologyOrder', radiologyOrderSchema);
module.exports = { RadiologyOrder, RADIOLOGY_STATUSES };
