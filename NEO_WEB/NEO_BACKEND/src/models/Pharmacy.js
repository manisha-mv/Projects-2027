// src/models/Pharmacy.js
const mongoose = require('mongoose');

// ─── Prescription Schema ──────────────────────────────────────────────────────
const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    prescribedDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Partially Dispensed', 'Dispensed', 'Cancelled', 'PRESCRIBED', 'VERIFIED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED'],
      default: 'Pending',
      index: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        duration: { type: String, default: '' },
        quantity: { type: Number, required: true },
        dispensed: { type: Number, default: 0 },
      },
    ],
    notes: { type: String, default: '' },
    dispensedAt: { type: Date, default: null },
    dispensedBy: { type: String, default: null },
  },
  { timestamps: true }
);

// ─── Medicine Inventory Schema ─────────────────────────────────────────────────
const medicineInventorySchema = new mongoose.Schema(
  {
    medicineId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    manufacturer: { type: String, default: '' },
    supplier: { type: String, default: '' },
    batchNo: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 20 },
    unitPrice: { type: Number, default: 0 },
    mrp: { type: Number, required: true, default: 0 },
    expiryDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    location: { type: String, default: 'Main Store' },
    unit: { type: String, default: 'Tablets' },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Expired'],
      default: 'In Stock',
      index: true,
    },
  },
  { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
const Medicine = mongoose.model('Medicine', medicineInventorySchema);

module.exports = { Prescription, Medicine };
