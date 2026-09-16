// src/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: 'hospital_profile' },
    hospitalName: { type: String, default: 'NEO-HMS Smart Hospital System' },
    tagline: { type: String, default: 'Smart Integrated Hospital Management & Traceability System' },
    contactEmail: { type: String, default: 'admin@neohms.in' },
    contactPhone: { type: String, default: '+91 80 2234 5678' },
    address: { type: String, default: '100 Medical Center Way, Bengaluru, Karnataka 560001' },
    currency: { type: String, default: 'INR (₹)' },
    timezone: { type: String, default: 'Asia/Kolkata (IST)' },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
