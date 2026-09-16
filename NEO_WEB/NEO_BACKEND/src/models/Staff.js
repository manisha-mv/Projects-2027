// src/models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    staffId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    department: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    designation: { type: String, default: '' },
    joiningDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    shift: { type: String, default: 'General' },
    status: { type: String, enum: ['Active', 'On Leave', 'Suspended', 'Resigned'], default: 'Active' },
  },
  { timestamps: true }
);

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
