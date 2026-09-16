// src/controllers/laboratory.controller.js
const { LabOrder } = require('../models/Laboratory');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getOrders = async (req, res, next) => {
  try {
    const { search = '', status = '', urgency = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { testName: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LabOrder.countDocuments(query);
    const orders = await LabOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.orderId) {
      const count = await LabOrder.countDocuments();
      data.orderId = `LAB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.orderedDate) {
      data.orderedDate = new Date().toISOString().split('T')[0];
    }

    const order = await LabOrder.create(data);

    await logTraceabilityEvent({
      patientId: order.patientId,
      patientName: order.patientName,
      type: 'LAB_ORDERED',
      department: 'Laboratory',
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: 'DOCTOR',
      description: `Lab test ${order.testName} ordered (${order.urgency})`,
      relatedId: order.orderId,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const order = await LabOrder.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }] },
      updates,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    // Log traceability on key status changes
    if (updates.status === 'Sample Collected') {
      await logTraceabilityEvent({
        patientId: order.patientId,
        patientName: order.patientName,
        type: 'SAMPLE_COLLECTED',
        department: 'Laboratory',
        performedBy: req.user ? req.user.fullName : 'Lab Technician',
        role: 'LAB',
        description: `Sample collected for ${order.testName}`,
        relatedId: order.orderId,
      });
    } else if (updates.status === 'Result Entered') {
      await logTraceabilityEvent({
        patientId: order.patientId,
        patientName: order.patientName,
        type: 'LAB_RESULT_ENTERED',
        department: 'Laboratory',
        performedBy: req.user ? req.user.fullName : 'Lab Technician',
        role: 'LAB',
        description: `Result entered for ${order.testName}: ${order.result?.value}`,
        relatedId: order.orderId,
      });
    } else if (updates.status === 'Verified') {
      await logTraceabilityEvent({
        patientId: order.patientId,
        patientName: order.patientName,
        type: 'LAB_RESULT_VERIFIED',
        department: 'Laboratory',
        performedBy: req.user ? req.user.fullName : 'Lab Supervisor',
        role: 'LAB',
        description: `Result verified for ${order.testName}`,
        relatedId: order.orderId,
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getOrdersByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const orders = await LabOrder.find({ patientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

