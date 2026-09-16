// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, unique: true, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    forRoles: [String],
    read: { type: Boolean, default: false },
    link: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
