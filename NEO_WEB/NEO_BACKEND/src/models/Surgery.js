// src/models/Surgery.js
const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema(
  {
    surgeryId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    surgeonId: { type: String, default: '' },
    surgeonName: { type: String, required: true },
    procedure: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, default: '10:00' },
    estimatedDuration: { type: Number, default: 60 },
    otRoom: { type: String, default: 'OT-1' },
    anaesthesiologist: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Scheduled', 'Pre-Op Checklist', 'In Progress', 'Completed', 'Post-Op', 'Cancelled', 'REQUESTED', 'APPROVED', 'SCHEDULED', 'PRE_OP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'Scheduled',
      index: true,
    },
    preOpCompleted: { type: Boolean, default: false },
    intraOpNotes: { type: String, default: null },
    postOpNotes: { type: String, default: null },
    completedAt: { type: Date, default: null },
    assistants: [String],
  },
  { timestamps: true }
);

const Surgery = mongoose.model('Surgery', surgerySchema);
module.exports = Surgery;
