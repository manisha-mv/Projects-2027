// src/controllers/department.controller.js
const Department = require('../models/Department');
const { logAuditEvent } = require('../utils/eventLogger');

exports.getDepartments = async (req, res, next) => {
  try {
    const { search = '', status = '' } = req.query;
    const query = {};
    if (search.trim()) query.name = { $regex: search, $options: 'i' };
    if (status && status !== 'All') query.status = status;

    const departments = await Department.find(query).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) { next(error); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.deptId) {
      const count = await Department.countDocuments();
      data.deptId = `DEPT-${String(count + 1).padStart(3, '0')}`;
    }
    const dept = await Department.create(data);
    await logAuditEvent({ user: req.user, action: 'Create', module: 'Departments', description: `Department created: ${dept.name}` });
    res.status(201).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Department.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { deptId: id }] },
      req.body,
      { new: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    await logAuditEvent({ user: req.user, action: 'Update', module: 'Departments', description: `Department updated: ${dept.name}` });
    res.json({ success: true, data: dept });
  } catch (error) { next(error); }
};
