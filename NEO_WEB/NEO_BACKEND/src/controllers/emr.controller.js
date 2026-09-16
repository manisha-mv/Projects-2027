// src/controllers/emr.controller.js
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { Consultation } = require('../models/Consultation');
const { LabOrder } = require('../models/Laboratory');
const { RadiologyOrder } = require('../models/Radiology');
const { Prescription } = require('../models/Pharmacy');
const { Vitals } = require('../models/Nursing');
const { Admission } = require('../models/IPD');
const Discharge = require('../models/Discharge');
const FollowUp = require('../models/FollowUp');

exports.getEMR = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const [
      appointments,
      consultations,
      labOrders,
      radOrders,
      prescriptions,
      vitals,
      admissions,
      discharges,
      followups,
    ] = await Promise.all([
      Appointment.find({ patientId }).sort({ appointmentDate: -1 }).limit(20),
      Consultation.find({ patientId }).sort({ createdAt: -1 }).limit(20),
      LabOrder.find({ patientId }).sort({ createdAt: -1 }).limit(20),
      RadiologyOrder.find({ patientId }).sort({ createdAt: -1 }).limit(20),
      Prescription.find({ patientId }).sort({ createdAt: -1 }).limit(20),
      Vitals.find({ patientId }).sort({ recordedAt: -1 }).limit(20),
      Admission.find({ patientId }).sort({ admissionDate: -1 }).limit(10),
      Discharge.find({ patientId }).sort({ createdAt: -1 }).limit(10),
      FollowUp.find({ patientId }).sort({ scheduledDate: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        patient,
        appointments,
        consultations,
        labOrders,
        radOrders,
        prescriptions,
        vitals,
        admissions,
        discharges,
        followups,
      },
    });
  } catch (error) { next(error); }
};
