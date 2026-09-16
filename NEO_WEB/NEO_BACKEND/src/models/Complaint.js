// src/models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, default: null, index: true },
    patientName: { type: String, default: 'Anonymous' },
    department: { type: String, default: 'General' },
    category: { type: String, default: 'Other' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: String, default: 'Complaint Officer' },
    status: {
      type: String,
      enum: ['Open', 'Under Investigation', 'Resolved', 'Escalated', 'Closed', 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'ESCALATED', 'CLOSED'],
      default: 'Open',
      index: true,
    },
    submittedDate: { type: String, required: true },
    investigationNotes: { type: String, default: null },
    resolution: { type: String, default: null },
    closedDate: { type: String, default: null },
  },
  { timestamps: true }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
