// src/controllers/staff.controller.js
const Staff = require('../models/Staff');
const { logAuditEvent } = require('../utils/eventLogger');

exports.getStaff = async (req, res, next) => {
  try {
    const { search = '', role = '', department = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') query.role = role;
    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Staff.countDocuments(query);
    const staff = await Staff.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({ success: true, data: staff, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) { next(error); }
};

exports.createStaff = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.staffId) {
      const count = await Staff.countDocuments();
      data.staffId = `EMP-${String(count + 1).padStart(5, '0')}`;
    }
    if (!data.joiningDate) data.joiningDate = new Date().toISOString().split('T')[0];

    const staff = await Staff.create(data);
    await logAuditEvent({ user: req.user, action: 'Create', module: 'Staff', description: `Staff member created: ${staff.name} (${staff.role})` });
    res.status(201).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { staffId: id }] },
      req.body,
      { new: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });
    await logAuditEvent({ user: req.user, action: 'Update', module: 'Staff', description: `Staff updated: ${staff.name}` });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};
