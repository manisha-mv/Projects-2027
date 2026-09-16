const AuditLog = require('../models/AuditLog');

/**
 * createAuditLog — helper function to record an audit event.
 * Called directly from controllers.
 *
 * @param {Object} params
 * @param {Object} params.user         - req.user (the acting user)
 * @param {string} params.action       - CREATE | UPDATE | DELETE | VIEW | LOGIN | LOGOUT
 * @param {string} params.entity       - Entity name (e.g. 'Patient')
 * @param {string} [params.entityId]   - The affected record's ID
 * @param {Object} [params.details]    - Extra details (diff, description)
 * @param {Object} [params.req]        - Express request (for IP + UA)
 * @param {string} [params.status]     - SUCCESS | FAILURE
 */
const createAuditLog = async ({
  user,
  action,
  entity,
  entityId = null,
  details = null,
  req = null,
  status = 'SUCCESS',
}) => {
  try {
    await AuditLog.create({
      userId: user._id || user.id,
      userFullName: user.fullName || `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.headers?.['user-agent'] : null,
      status,
    });
  } catch (err) {
    // Audit log failure must NEVER crash the main request
    console.error('⚠️  Audit log write failed:', err.message);
  }
};

module.exports = { createAuditLog };
