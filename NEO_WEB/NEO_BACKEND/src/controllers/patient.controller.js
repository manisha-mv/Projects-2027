// src/controllers/patient.controller.js
const Patient = require('../models/Patient');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

// Helper to generate patient ID if missing
const generateId = async () => {
  const count = await Patient.countDocuments();
  const year = new Date().getFullYear();
  return `NEO-${year}-${String(count + 1).padStart(6, '0')}`;
};

exports.getPatients = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { patientId: id }],
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const patientData = req.body;

    if (!patientData.patientId) {
      patientData.patientId = await generateId();
    }

    // Adapt frontend structure to model structure if needed
    if (patientData.phone && !patientData.contact) {
      patientData.contact = { phone: patientData.phone, email: patientData.email, address: { street: patientData.address } };
    }

    if (!patientData.registeredBy && req.user) {
      patientData.registeredBy = req.user._id;
    }

    const patient = await Patient.create(patientData);

    // Event & Audit Logging
    await logTraceabilityEvent({
      patientId: patient.patientId,
      patientName: patient.fullName || `${patient.firstName} ${patient.lastName}`,
      type: 'PATIENT_REGISTERED',
      department: 'Registration',
      performedBy: req.user ? req.user.fullName : 'Receptionist',
      role: req.user ? req.user.role : 'RECEPTIONIST',
      description: `Patient ${patient.fullName} registered with ID ${patient.patientId}`,
      relatedId: patient.patientId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Create',
      module: 'Patients',
      patientId: patient.patientId,
      patientName: patient.fullName,
      description: `Registered new patient ${patient.patientId} (${patient.fullName})`,
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { patientId: id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await logAuditEvent({
      user: req.user,
      action: 'Update',
      module: 'Patients',
      patientId: patient.patientId,
      patientName: patient.fullName,
      description: `Updated profile for patient ${patient.patientId}`,
    });

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const TreatmentTraceability = require('../models/TreatmentTraceability');

exports.registerPatient = exports.createPatient;

exports.getPatientStats = async (req, res, next) => {
  try {
    const total = await Patient.countDocuments();
    const active = await Patient.countDocuments({ status: { $in: ['Active', 'active'] } });
    const inpatients = await Patient.countDocuments({ status: { $in: ['Inpatient', 'inpatient'] } });
    const outpatients = await Patient.countDocuments({ status: { $in: ['Outpatient', 'outpatient'] } });
    const discharged = await Patient.countDocuments({ status: { $in: ['Discharged', 'discharged'] } });

    res.json({
      success: true,
      data: {
        total,
        active,
        inpatients,
        outpatients,
        discharged,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { patientId: id }],
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    const events = await TreatmentTraceability.find({ patientId: patient.patientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

