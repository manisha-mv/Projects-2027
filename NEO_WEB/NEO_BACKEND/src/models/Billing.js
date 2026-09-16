// src/models/Billing.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    dueDate: { type: String, default: null },
    items: [
      {
        description: { type: String, required: true },
        qty: { type: Number, default: 1 },
        rate: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    paid: { type: Number, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'],
      default: 'Issued',
      index: true,
    },
    paymentMethod: { type: String, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: String, default: 'Billing Staff' },
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
