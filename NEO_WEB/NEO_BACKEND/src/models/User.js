// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = [
  'ADMIN',
  'SUPER_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'LAB',
  'LAB_TECHNICIAN',
  'RADIOLOGY',
  'RADIOLOGIST',
  'PHARMACIST',
  'BILLING',
  'INSURANCE',
  'COMPLAINT_OFFICER',
  // Lowercase legacy aliases
  'super_admin',
  'admin',
  'doctor',
  'nurse',
  'lab_technician',
  'radiologist',
  'pharmacist',
  'receptionist',
];

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: [true, 'Role is required'],
      uppercase: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('initials').get(function () {
  return `${this.firstName?.[0] || ''}${this.lastName?.[0] || ''}`.toUpperCase() || 'US';
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.ROLES = ROLES;

const User = mongoose.model('User', userSchema);
module.exports = User;
