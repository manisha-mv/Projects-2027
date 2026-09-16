// src/controllers/complaint.controller.js
const Complaint = require('../models/Complaint');
const { logAuditEvent } = require('../utils/eventLogger');

const today = () => new Date().toISOString().split('T')[0];

exports.getComplaints = async (req, res, next) => {
  try {
    const { search = '', status = '', category = '', priority = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({ success: true, data: complaints, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) {
    next(error);
  }
};

exports.createComplaint = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.complaintId) {
      const count = await Complaint.countDocuments();
      data.complaintId = `CMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.submittedDate) data.submittedDate = today();
    if (!data.status) data.status = 'Open';

    const complaint = await Complaint.create(data);

    await logAuditEvent({ user: req.user, action: 'Create', module: 'Complaints', description: `Complaint ${complaint.complaintId} filed: ${complaint.subject}` });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'Resolved' || updates.status === 'Closed') {
      updates.closedDate = today();
    }

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }] },
      updates,
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    await logAuditEvent({ user: req.user, action: 'Update', module: 'Complaints', description: `Complaint ${complaint.complaintId} updated to ${complaint.status}` });

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};
