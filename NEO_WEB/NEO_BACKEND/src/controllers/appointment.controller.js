// src/controllers/appointment.controller.js
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

const generateAptId = async () => {
  const count = await Appointment.countDocuments();
  const year = new Date().getFullYear();
  return `APT-${year}-${String(count + 1).padStart(6, '0')}`;
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { search = '', status = '', doctorId = '', date = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { appointmentId: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (date) query.appointmentDate = date;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: appointments,
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

exports.createAppointment = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.appointmentId) {
      data.appointmentId = await generateAptId();
    }

    // Double-booking check: same doctor, date, timeSlot
    if (data.doctorId && data.appointmentDate && data.timeSlot) {
      const existing = await Appointment.findOne({
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        timeSlot: data.timeSlot,
        status: { $nin: ['Cancelled', 'CANCELLED'] },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Dr. ${data.doctorName || data.doctorId} is already booked at ${data.timeSlot} on ${data.appointmentDate}.`,
        });
      }
    }

    const appointment = await Appointment.create(data);

    await logTraceabilityEvent({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      type: 'APPOINTMENT_CREATED',
      department: appointment.department || 'Outpatient',
      performedBy: req.user ? req.user.fullName : 'Receptionist',
      role: req.user ? req.user.role : 'RECEPTIONIST',
      description: `Appointment ${appointment.appointmentId} booked with ${appointment.doctorName} for ${appointment.appointmentDate}`,
      relatedId: appointment.appointmentId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Create',
      module: 'Appointments',
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      description: `Created appointment ${appointment.appointmentId}`,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { appointmentId: id }] },
      req.body,
      { new: true }
    );

    if (!patient) {
      // ignore
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { appointmentId: id }] },
      { status: 'Checked In', checkinTime: new Date() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await logTraceabilityEvent({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      type: 'CHECK_IN',
      department: appointment.department,
      performedBy: req.user ? req.user.fullName : 'Receptionist',
      role: req.user ? req.user.role : 'RECEPTIONIST',
      description: `Patient checked in for appointment ${appointment.appointmentId}`,
      relatedId: appointment.appointmentId,
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const total = await Appointment.countDocuments();
    const scheduled = await Appointment.countDocuments({ status: 'Scheduled' });
    const confirmed = await Appointment.countDocuments({ status: 'Confirmed' });
    const completed = await Appointment.countDocuments({ status: 'Completed' });
    const cancelled = await Appointment.countDocuments({ status: 'Cancelled' });

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        confirmed,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctorId and date are required',
      });
    }

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: { $nin: ['Cancelled', 'No Show'] },
    }).select('timeSlot');

    const bookedSlots = appointments.map((appointment) => appointment.timeSlot);

    res.json({
      success: true,
      data: bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { appointmentId: id }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
