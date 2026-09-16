// src/models/Insurance.js
const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    claimId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    invoiceId: { type: String, default: null },
    provider: { type: String, required: true, index: true },
    policyNo: { type: String, required: true },
    claimAmount: { type: Number, required: true },
    approvedAmount: { type: Number, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Paid', 'Closed', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED', 'CLOSED'],
      default: 'Submitted',
      index: true,
    },
    submittedDate: { type: String, required: true },
    reviewedDate: { type: String, default: null },
    paymentDate: { type: String, default: null },
    notes: { type: String, default: '' },
    documents: [String],
  },
  { timestamps: true }
);

const policySchema = new mongoose.Schema(
  {
    policyId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    provider: { type: String, required: true },
    policyNo: { type: String, required: true },
    coverAmount: { type: Number, required: true },
    usedAmount: { type: Number, default: 0 },
    validFrom: { type: String, required: true },
    validTo: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' },
  },
  { timestamps: true }
);

const InsuranceClaim = mongoose.model('InsuranceClaim', claimSchema);
const InsurancePolicy = mongoose.model('InsurancePolicy', policySchema);

module.exports = { InsuranceClaim, InsurancePolicy };
