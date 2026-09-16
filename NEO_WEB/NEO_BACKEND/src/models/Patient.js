// src/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true,
      },
      email: { type: String, lowercase: true, trim: true, default: null },
      address: {
        street: { type: String, trim: true, default: null },
        city: { type: String, trim: true, default: 'Bengaluru' },
        state: { type: String, trim: true, default: 'Karnataka' },
        postalCode: { type: String, trim: true, default: null },
        country: { type: String, trim: true, default: 'India' },
      },
    },
    emergencyContact: {
      name: { type: String, trim: true, default: null },
      relation: { type: String, trim: true, default: null },
      phone: { type: String, trim: true, default: null },
    },
    medicalHistory: [
      {
        condition: { type: String, trim: true },
        since: { type: String, trim: true },
        notes: { type: String, trim: true },
      },
    ],
    allergies: [
      {
        substance: { type: String, trim: true },
        reaction: { type: String, trim: true },
        severity: {
          type: String,
          enum: ['Mild', 'Moderate', 'Severe'],
          default: 'Moderate',
        },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Inpatient', 'Outpatient', 'Discharged', 'Inactive'],
      default: 'Active',
      index: true,
    },
    notes: { type: String, default: '' },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : 0;
});

patientSchema.index({ firstName: 'text', lastName: 'text', patientId: 'text' });
patientSchema.index({ 'contact.phone': 1 });
patientSchema.index({ createdAt: -1 });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
