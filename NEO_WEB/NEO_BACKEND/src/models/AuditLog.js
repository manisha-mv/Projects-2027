// src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'system' },
    userName: { type: String, required: true },
    role: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    patientId: { type: String, default: null, index: true },
    patientName: { type: String, default: null },
    description: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    status: { type: String, enum: ['Success', 'Failed', 'Warning'], default: 'Success', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
