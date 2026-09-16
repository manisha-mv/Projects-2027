// src/utils/eventLogger.js
const TreatmentTraceability = require('../models/TreatmentTraceability');
const AuditLog = require('../models/AuditLog');

/**
 * Log a treatment traceability event for a patient.
 */
const logTraceabilityEvent = async ({
  patientId,
  patientName = '',
  type,
  department = 'General',
  performedBy = 'System',
  role = 'Staff',
  status = 'Completed',
  relatedId = null,
  description = '',
  metadata = {},
}) => {
  try {
    if (!patientId) return;
    await TreatmentTraceability.create({
      patientId,
      patientName,
      type,
      department,
      performedBy,
      role,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      status,
      relatedId,
      description,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log traceability event:', err.message);
  }
};

/**
 * Log an audit action in the system.
 */
const logAuditEvent = async ({
  user = null,
  action,
  module,
  patientId = null,
  patientName = null,
  description,
  ipAddress = '127.0.0.1',
  status = 'Success',
  metadata = {},
}) => {
  try {
    const userName = user ? (user.fullName || user.name || user.email) : 'System';
    const role = user ? user.role : 'SYSTEM';

    await AuditLog.create({
      userId: user ? user._id.toString() : 'system',
      userName,
      role,
      action,
      module,
      patientId,
      patientName,
      description,
      ipAddress,
      status,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
};

module.exports = { logTraceabilityEvent, logAuditEvent };
