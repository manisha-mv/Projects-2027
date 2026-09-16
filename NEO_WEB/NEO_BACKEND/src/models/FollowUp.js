// src/models/FollowUp.js
const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    followupId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    department: { type: String, default: 'General Medicine' },
    scheduledDate: { type: String, required: true, index: true },
    status: { type: String, enum: ['Upcoming', 'Overdue', 'Completed', 'Cancelled'], default: 'Upcoming', index: true },
    reason: { type: String, required: true },
    appointmentId: { type: String, default: null },
    notes: { type: String, default: '' },
    completedAt: { type: String, default: null },
  },
  { timestamps: true }
);

const FollowUp = mongoose.model('FollowUp', followUpSchema);
module.exports = FollowUp;
