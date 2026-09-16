// src/controllers/surgery.controller.js
const Surgery = require('../models/Surgery');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getSurgeries = async (req, res, next) => {
  try {
    const { search = '', status = '', date = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { procedure: { $regex: search, $options: 'i' } },
        { surgeryId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (date) query.scheduledDate = date;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Surgery.countDocuments(query);
    const surgeries = await Surgery.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: surgeries,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.scheduleSurgery = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.surgeryId) {
      const count = await Surgery.countDocuments();
      data.surgeryId = `SRG-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const surgery = await Surgery.create(data);

    await logTraceabilityEvent({
      patientId: surgery.patientId,
      patientName: surgery.patientName,
      type: 'PROCEDURE_COMPLETED',
      department: 'Surgery / OT',
      performedBy: surgery.surgeonName,
      role: 'DOCTOR',
      status: 'Scheduled',
      description: `Surgery scheduled: ${surgery.procedure} in ${surgery.otRoom}`,
      relatedId: surgery.surgeryId,
    });

    res.status(201).json({ success: true, data: surgery });
  } catch (error) {
    next(error);
  }
};

exports.updateSurgery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const surgery = await Surgery.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { surgeryId: id }] },
      updates,
      { new: true }
    );

    if (!surgery) return res.status(404).json({ success: false, message: 'Surgery record not found' });

    if (updates.status === 'Completed') {
      await logTraceabilityEvent({
        patientId: surgery.patientId,
        patientName: surgery.patientName,
        type: 'PROCEDURE_COMPLETED',
        department: 'Surgery / OT',
        performedBy: surgery.surgeonName,
        role: 'DOCTOR',
        status: 'Completed',
        description: `Procedure completed: ${surgery.procedure}`,
        relatedId: surgery.surgeryId,
      });
    }

    res.json({ success: true, data: surgery });
  } catch (error) {
    next(error);
  }
};
