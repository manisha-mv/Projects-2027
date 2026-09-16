// src/controllers/dashboard.controller.js
// Role-aware dashboard stats for NEO-HMS

const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { Admission, Bed } = require('../models/IPD');
const { LabOrder } = require('../models/Laboratory');
const { RadiologyOrder } = require('../models/Radiology');
const { Prescription } = require('../models/Pharmacy');
const Invoice = require('../models/Billing');
const Emergency = require('../models/Emergency');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const todayStr = () => new Date().toISOString().split('T')[0];

/**
 * GET /api/dashboard/stats
 * Returns role-specific stats. ADMIN gets full hospital overview.
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = (req.user?.role || '').toUpperCase();
    const today = todayStr();

    // ── Shared base stats (used by most roles) ────────────────
    const [
      totalPatients,
      todayAppointments,
      availableBeds,
      occupiedBeds,
      activeAdmissions,
      activeEmergencies,
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments({ appointmentDate: today }),
      Bed.countDocuments({ status: 'Available' }),
      Bed.countDocuments({ status: 'Occupied' }),
      Admission.countDocuments({ status: 'Active' }),
      Emergency.countDocuments({ status: { $in: ['Active', 'Critical', 'Stable'] } }),
    ]);

    const totalBeds = availableBeds + occupiedBeds;
    const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // ── ADMIN / SUPER_ADMIN — full hospital overview ───────────
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const [
        pendingLabOrders,
        revenueToday,
        pendingInvoices,
        unreadNotifications,
        pendingRadiology,
        pendingPrescriptions,
      ] = await Promise.all([
        LabOrder.countDocuments({ status: { $in: ['Ordered', 'Sample Collected', 'Processing'] } }),
        Invoice.aggregate([
          { $match: { status: 'Paid', createdAt: { $gte: new Date(today) } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Invoice.countDocuments({ status: { $in: ['Issued', 'Partially Paid', 'Overdue'] } }),
        Notification.countDocuments({ read: false }),
        RadiologyOrder.countDocuments({ status: { $in: ['Requested', 'Scheduled'] } }),
        Prescription.countDocuments({ status: { $in: ['Pending', 'Partially Dispensed'] } }),
      ]);

      return res.json({
        success: true,
        role,
        data: {
          totalPatients,
          todayAppointments,
          availableBeds,
          occupiedBeds,
          totalBeds,
          occupancyPct,
          activeAdmissions,
          activeEmergencies,
          pendingLabOrders,
          revenueToday: revenueToday[0]?.total || 0,
          pendingInvoices,
          unreadNotifications,
          pendingRadiology,
          pendingPrescriptions,
        },
      });
    }

    // ── DOCTOR ───────────────────────────────────────────────
    if (role === 'DOCTOR') {
      const [myTodayApts, pendingResults, myAdmissions] = await Promise.all([
        Appointment.countDocuments({ appointmentDate: today, doctorId: req.user._id }),
        LabOrder.countDocuments({ status: 'Result Available' }),
        Admission.countDocuments({ status: 'Active', doctorId: req.user._id }),
      ]);
      return res.json({
        success: true, role,
        data: { myTodayApts, pendingResults, myAdmissions, activeEmergencies, totalPatients },
      });
    }

    // ── NURSE ─────────────────────────────────────────────────
    if (role === 'NURSE') {
      const [assignedPatients, pendingVitals] = await Promise.all([
        Admission.countDocuments({ status: 'Active' }),
        Admission.countDocuments({ status: 'Active', condition: { $in: ['Critical', 'Serious'] } }),
      ]);
      return res.json({
        success: true, role,
        data: { assignedPatients, pendingVitals, activeEmergencies, todayAppointments },
      });
    }

    // ── RECEPTIONIST ──────────────────────────────────────────
    if (role === 'RECEPTIONIST') {
      const [checkedIn, waiting, completed, scheduled] = await Promise.all([
        Appointment.countDocuments({ appointmentDate: today, status: 'Checked In' }),
        Appointment.countDocuments({ appointmentDate: today, status: 'Waiting' }),
        Appointment.countDocuments({ appointmentDate: today, status: 'Completed' }),
        Appointment.countDocuments({ appointmentDate: today, status: { $in: ['Scheduled', 'Confirmed'] } }),
      ]);
      return res.json({
        success: true, role,
        data: { todayAppointments, checkedIn, waiting, completed, scheduled, totalPatients },
      });
    }

    // ── LAB ───────────────────────────────────────────────────
    if (role === 'LAB' || role === 'LAB_TECHNICIAN') {
      const [pendingOrders, statOrders, resultsReady, completedToday] = await Promise.all([
        LabOrder.countDocuments({ status: { $in: ['Ordered', 'Sample Collected'] } }),
        LabOrder.countDocuments({ urgency: 'STAT', status: { $in: ['Ordered', 'Processing'] } }),
        LabOrder.countDocuments({ status: 'Result Available' }),
        LabOrder.countDocuments({ status: 'Completed', createdAt: { $gte: new Date(today) } }),
      ]);
      return res.json({
        success: true, role,
        data: { pendingOrders, statOrders, resultsReady, completedToday },
      });
    }

    // ── RADIOLOGY ─────────────────────────────────────────────
    if (role === 'RADIOLOGY' || role === 'RADIOLOGIST') {
      const [pendingOrders, scheduled, reported] = await Promise.all([
        RadiologyOrder.countDocuments({ status: 'Requested' }),
        RadiologyOrder.countDocuments({ status: 'Scheduled' }),
        RadiologyOrder.countDocuments({ status: 'Report Ready', createdAt: { $gte: new Date(today) } }),
      ]);
      return res.json({
        success: true, role,
        data: { pendingOrders, scheduled, reported },
      });
    }

    // ── PHARMACIST ────────────────────────────────────────────
    if (role === 'PHARMACIST') {
      const [pendingPrescriptions, dispensedToday, partialOrders] = await Promise.all([
        Prescription.countDocuments({ status: 'Pending' }),
        Prescription.countDocuments({ status: 'Dispensed', updatedAt: { $gte: new Date(today) } }),
        Prescription.countDocuments({ status: 'Partially Dispensed' }),
      ]);
      return res.json({
        success: true, role,
        data: { pendingPrescriptions, dispensedToday, partialOrders },
      });
    }

    // ── BILLING / INSURANCE ───────────────────────────────────
    if (role === 'BILLING' || role === 'INSURANCE') {
      const [revenueToday, pendingInvoices, overdueInvoices, paidToday] = await Promise.all([
        Invoice.aggregate([
          { $match: { status: 'Paid', updatedAt: { $gte: new Date(today) } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Invoice.countDocuments({ status: { $in: ['Issued', 'Partially Paid'] } }),
        Invoice.countDocuments({ status: 'Overdue' }),
        Invoice.countDocuments({ status: 'Paid', updatedAt: { $gte: new Date(today) } }),
      ]);
      return res.json({
        success: true, role,
        data: {
          revenueToday: revenueToday[0]?.total || 0,
          pendingInvoices,
          overdueInvoices,
          paidToday,
        },
      });
    }

    // ── DEFAULT fallback (shared stats) ───────────────────────
    return res.json({
      success: true, role,
      data: { totalPatients, todayAppointments, availableBeds, activeAdmissions, activeEmergencies },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/activity
 * Recent hospital activity feed (last 10 audit log entries)
 */
exports.getDashboardActivity = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action module description createdAt userEmail userRole');
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/census
 * Current hospital census (bed occupancy, shift info)
 */
exports.getDashboardCensus = async (req, res, next) => {
  try {
    const today = todayStr();
    const [totalBeds, available, occupied, maintenance, admittedToday, dischargedToday, scheduledDischarges, pendingAdmissions] =
      await Promise.all([
        Bed.countDocuments(),
        Bed.countDocuments({ status: 'Available' }),
        Bed.countDocuments({ status: 'Occupied' }),
        Bed.countDocuments({ status: 'Maintenance' }),
        Admission.countDocuments({ admitDate: today, status: 'Active' }),
        Admission.countDocuments({ dischargeDate: today }),
        Admission.countDocuments({ expectedDischargeDate: today, status: 'Active' }),
        Appointment.countDocuments({ appointmentDate: today, status: { $in: ['Confirmed', 'Scheduled'] } }),
      ]);

    const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

    const now = new Date();
    const hour = now.getHours();
    const shift = hour < 8 ? 'Night' : hour < 16 ? 'Morning' : 'Evening';
    const shiftTimes = { Night: ['00:00', '08:00'], Morning: ['08:00', '16:00'], Evening: ['16:00', '00:00'] };

    res.json({
      success: true,
      data: {
        census: {
          totalInpatients: occupied,
          admittedToday,
          dischargedToday,
          scheduledDischarges,
          pendingAdmissions,
          occupancyPct,
        },
        beds: { total: totalBeds, available, occupied, maintenance },
        shift,
        shiftStart: shiftTimes[shift][0],
        shiftEnd: shiftTimes[shift][1],
      },
    });
  } catch (error) {
    next(error);
  }
};
