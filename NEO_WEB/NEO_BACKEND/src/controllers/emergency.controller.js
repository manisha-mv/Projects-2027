// src/controllers/emergency.controller.js
const Emergency = require('../models/Emergency');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getPatients = async (req, res, next) => {
  try {
    const { search = '', status = '', triage = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { emergencyId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (triage && triage !== 'All') query.triage = triage;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Emergency.countDocuments(query);
    const patients = await Emergency.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: patients,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.registerEmergency = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.emergencyId) {
      const count = await Emergency.countDocuments();
      data.emergencyId = `EM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const patient = await Emergency.create(data);

    if (patient.patientId) {
      await logTraceabilityEvent({
        patientId: patient.patientId,
        patientName: patient.patientName,
        type: 'ADMISSION_CREATED',
        department: 'Emergency',
        performedBy: req.user ? req.user.fullName : 'Emergency Staff',
        role: 'NURSE',
        status: 'Critical',
        description: `Registered emergency case: ${patient.chiefComplaint} (${patient.triage})`,
        relatedId: patient.emergencyId,
      });
    }

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Emergency.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { emergencyId: id }] },
      updates,
      { new: true }
    );

    if (!patient) return res.status(404).json({ success: false, message: 'Emergency case not found' });

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
