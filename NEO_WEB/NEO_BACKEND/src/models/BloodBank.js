// src/models/BloodBank.js
const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      unique: true,
      index: true,
    },
    units: { type: Number, required: true, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, required: true, default: 0 },
    expiryDates: [String],
    lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true, index: true },
    units: { type: Number, required: true, default: 1 },
    urgency: { type: String, enum: ['Routine', 'Urgent', 'STAT'], default: 'Routine' },
    requestedBy: { type: String, required: true },
    requestedAt: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Issued', 'Rejected', 'Returned'], default: 'Pending', index: true },
    issuedAt: { type: String, default: null },
    issuedBy: { type: String, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = { BloodInventory, BloodRequest };
