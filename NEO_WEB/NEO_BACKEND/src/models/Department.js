// src/models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    deptId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, unique: true },
    head: { type: String, default: 'Unassigned' },
    staffCount: { type: Number, default: 0 },
    beds: { type: Number, default: 0 },
    occupied: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
