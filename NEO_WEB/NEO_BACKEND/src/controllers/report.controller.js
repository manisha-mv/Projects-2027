// src/controllers/report.controller.js
const Patient = require('../models/Patient');
const { LabOrder } = require('../models/Laboratory');
const { RadiologyOrder } = require('../models/Radiology');
const { Prescription } = require('../models/Pharmacy');
const { Admission } = require('../models/IPD');
const Invoice = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Emergency = require('../models/Emergency');

exports.getReports = async (req, res, next) => {
  try {
    const { type = 'overview', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    const hasDateFilter = startDate || endDate;

    // --- Overview / Dashboard Stats ---
    if (type === 'overview' || !type) {
      const [
        totalPatients,
        activeAdmissions,
        todayAppointments,
        emergencyCases,
        totalRevenue,
        pendingBalance,
        labOrders,
        radOrders,
      ] = await Promise.all([
        Patient.countDocuments(),
        Admission.countDocuments({ status: 'Active' }),
        Appointment.countDocuments({ appointmentDate: new Date().toISOString().split('T')[0] }),
        Emergency.countDocuments({ status: { $in: ['Active', 'Critical', 'Stable'] } }),
        Invoice.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
        Invoice.aggregate([{ $match: { status: { $in: ['Issued', 'Partially Paid', 'Overdue'] } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
        LabOrder.countDocuments(hasDateFilter ? { createdAt: dateFilter } : {}),
        RadiologyOrder.countDocuments(hasDateFilter ? { createdAt: dateFilter } : {}),
      ]);

      return res.json({
        success: true,
        data: {
          type: 'overview',
          patients: {
            total: totalPatients,
            activeInpatients: activeAdmissions,
          },
          appointments: {
            today: todayAppointments,
          },
          emergency: {
            active: emergencyCases,
          },
          billing: {
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingBalance: pendingBalance[0]?.total || 0,
          },
          lab: { orders: labOrders },
          radiology: { orders: radOrders },
        },
      });
    }

    // --- Patient Demographics Report ---
    if (type === 'patients') {
      const byGender = await Patient.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
      const byBloodGroup = await Patient.aggregate([{ $group: { _id: '$bloodGroup', count: { $sum: 1 } } }]);
      const byStatus = await Patient.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      return res.json({ success: true, data: { type: 'patients', byGender, byBloodGroup, byStatus } });
    }

    // --- Revenue Report ---
    if (type === 'revenue') {
      const q = hasDateFilter ? { createdAt: dateFilter } : {};
      const [totalPaid, pending, invoicesByStatus] = await Promise.all([
        Invoice.aggregate([{ $match: { ...q, status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: { ...q, status: { $in: ['Issued', 'Partially Paid'] } } }, { $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: q }, { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }]),
      ]);
      return res.json({ success: true, data: { type: 'revenue', totalPaid: totalPaid[0] || {}, pending: pending[0] || {}, byStatus: invoicesByStatus } });
    }

    // --- Appointments Report ---
    if (type === 'appointments') {
      const q = hasDateFilter ? { createdAt: dateFilter } : {};
      const [byStatus, byDept, byType] = await Promise.all([
        Appointment.aggregate([{ $match: q }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
        Appointment.aggregate([{ $match: q }, { $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
        Appointment.aggregate([{ $match: q }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
      ]);
      return res.json({ success: true, data: { type: 'appointments', byStatus, byDepartment: byDept, byType } });
    }

    // Fallback
    res.json({ success: true, data: { type, message: 'Report type not yet implemented' } });
  } catch (error) { next(error); }
};
