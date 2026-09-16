// src/models/Laboratory.js
const mongoose = require('mongoose');

const LAB_STATUSES = [
  'Pending',
  'Sample Collected',
  'Processing',
  'Result Entered',
  'Verified',
  'Completed',
  'Cancelled',
  // Uppercase aliases
  'ORDERED',
  'SAMPLE_COLLECTED',
  'PROCESSING',
  'RESULT_ENTERED',
  'VERIFIED',
  'COMPLETED',
];

const labOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    testName: { type: String, required: true, index: true },
    sampleType: { type: String, default: 'Blood' },
    urgency: { type: String, enum: ['Routine', 'Urgent', 'STAT'], default: 'Routine' },
    status: { type: String, enum: LAB_STATUSES, default: 'Pending', index: true },
    orderedDate: { type: String, required: true },
    sampleCollectedAt: { type: Date, default: null },
    resultEnteredAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    result: {
      value: { type: String, default: null },
      report: { type: String, default: null },
    },
    technicianName: { type: String, default: null },
    verifiedBy: { type: String, default: null },
    department: { type: String, default: 'Laboratory' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const LabOrder = mongoose.model('LabOrder', labOrderSchema);
module.exports = { LabOrder, LAB_STATUSES };
