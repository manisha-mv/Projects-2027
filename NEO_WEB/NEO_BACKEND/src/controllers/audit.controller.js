const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/audit — paginated audit logs (super_admin / admin only) ─────────
const getAuditLogs = asyncHandler(async (req, res) => {
  const { entity, action, userId, startDate, endDate, from, to, page = 1, limit = 30 } = req.query;
  const filter = {};

  const start = startDate || from;
  const end = endDate || to;

  if (entity) filter.entity = entity;
  if (action) filter.action = action;
  if (userId) filter.userId = userId;
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: logs,
  });
});

module.exports = { getAuditLogs };
