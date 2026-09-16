// src/controllers/discharge.controller.js
const Discharge = require('../models/Discharge');
const { Admission } = require('../models/IPD');
const Patient = require('../models/Patient');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

const today = () => new Date().toISOString().split('T')[0];

exports.getDischarges = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { dischargeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Discharge.countDocuments(query);
    const discharges = await Discharge.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({ success: true, data: discharges, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) { next(error); }
};

exports.createDischarge = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.dischargeId) {
      const count = await Discharge.countDocuments();
      data.dischargeId = `DSC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.scheduledDate) data.scheduledDate = today();

    const discharge = await Discharge.create(data);

    await logTraceabilityEvent({
      patientId: discharge.patientId,
      patientName: discharge.patientName,
      type: 'DISCHARGE_CREATED',
      department: 'Discharge',
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: req.user ? req.user.role : 'DOCTOR',
      description: `Discharge initiated for ${discharge.patientName} — Diagnosis: ${discharge.diagnosis}`,
      relatedId: discharge.dischargeId,
    });

    res.status(201).json({ success: true, data: discharge });
  } catch (error) { next(error); }
};

exports.updateDischarge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'Completed') {
      updates.actualDischargeDate = today();
    }

    const discharge = await Discharge.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { dischargeId: id }] },
      updates,
      { new: true }
    );

    if (!discharge) return res.status(404).json({ success: false, message: 'Discharge record not found' });

    if (updates.status === 'Completed') {
      // Update admission status and patient status
      if (discharge.admissionId) {
        await Admission.findOneAndUpdate({ admissionId: discharge.admissionId }, { status: 'Discharged', dischargeDate: today() });
      }
      await Patient.findOneAndUpdate({ patientId: discharge.patientId }, { status: 'Discharged' });

      await logTraceabilityEvent({
        patientId: discharge.patientId,
        patientName: discharge.patientName,
        type: 'DISCHARGE_CREATED',
        department: 'Discharge',
        performedBy: req.user ? req.user.fullName : 'Doctor',
        role: req.user ? req.user.role : 'DOCTOR',
        status: 'Completed',
        description: `Discharge completed — ${discharge.dischargeType} — Follow-up: ${discharge.followUpDate || 'N/A'}`,
        relatedId: discharge.dischargeId,
      });

      await logAuditEvent({ user: req.user, action: 'Discharge', module: 'Discharge', patientId: discharge.patientId, patientName: discharge.patientName, description: `Discharged patient ${discharge.patientName}` });
    }

    res.json({ success: true, data: discharge });
  } catch (error) { next(error); }
};
