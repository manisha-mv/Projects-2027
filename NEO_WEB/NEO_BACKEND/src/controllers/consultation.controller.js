// src/controllers/consultation.controller.js
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.createConsultation = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.consultationId) {
      const count = await Consultation.countDocuments();
      data.consultationId = `CNS-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    }

    const consultation = await Consultation.create(data);

    // If appointment ID was passed, update appointment status to Completed
    if (data.appointmentId) {
      await Appointment.findOneAndUpdate(
        { appointmentId: data.appointmentId },
        { status: 'Completed', consultationEndTime: new Date() }
      );
    }

    await logTraceabilityEvent({
      patientId: consultation.patientId,
      patientName: consultation.patientName,
      type: 'CONSULTATION_COMPLETED',
      department: consultation.department,
      performedBy: req.user ? req.user.fullName : consultation.doctorName,
      role: 'DOCTOR',
      description: `Consultation completed with diagnosis: ${consultation.diagnosis}`,
      relatedId: consultation.consultationId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Create',
      module: 'Consultation',
      patientId: consultation.patientId,
      patientName: consultation.patientName,
      description: `Created consultation record ${consultation.consultationId}`,
    });

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};

exports.getConsultations = async (req, res, next) => {
  try {
    const { patientId = '', doctorId = '' } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const consultations = await Consultation.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: consultations });
  } catch (error) {
    next(error);
  }
};
