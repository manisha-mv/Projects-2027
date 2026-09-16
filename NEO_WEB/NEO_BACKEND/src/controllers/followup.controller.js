// src/controllers/followup.controller.js
const FollowUp = require('../models/FollowUp');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

const today = () => new Date().toISOString().split('T')[0];

exports.getFollowups = async (req, res, next) => {
  try {
    const { status = '', search = '', page = 1, limit = 20 } = req.query;

    // Auto-mark overdue
    await FollowUp.updateMany(
      { status: 'Upcoming', scheduledDate: { $lt: today() } },
      { status: 'Overdue' }
    );

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { followupId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await FollowUp.countDocuments(query);
    const followups = await FollowUp.find(query).sort({ scheduledDate: 1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({ success: true, data: followups, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) {
    next(error);
  }
};

exports.createFollowup = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.followupId) {
      const count = await FollowUp.countDocuments();
      data.followupId = `FU-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const followup = await FollowUp.create(data);

    await logTraceabilityEvent({
      patientId: followup.patientId,
      patientName: followup.patientName,
      type: 'FOLLOWUP_CREATED',
      department: followup.department || 'General Medicine',
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: req.user ? req.user.role : 'DOCTOR',
      description: `Follow-up scheduled for ${followup.scheduledDate}: ${followup.reason}`,
      relatedId: followup.followupId,
    });

    res.status(201).json({ success: true, data: followup });
  } catch (error) {
    next(error);
  }
};

exports.markComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const followup = await FollowUp.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { followupId: id }] },
      { status: 'Completed', completedAt: today(), ...(notes && { notes }) },
      { new: true }
    );

    if (!followup) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    res.json({ success: true, data: followup });
  } catch (error) {
    next(error);
  }
};
