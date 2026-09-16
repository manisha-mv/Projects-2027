// src/controllers/radiology.controller.js
const { RadiologyOrder } = require('../models/Radiology');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getOrders = async (req, res, next) => {
  try {
    const { search = '', status = '', modality = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (modality && modality !== 'All') query.modality = modality;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await RadiologyOrder.countDocuments(query);
    const orders = await RadiologyOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

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
      const count = await RadiologyOrder.countDocuments();
      data.orderId = `RAD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.orderedDate) {
      data.orderedDate = new Date().toISOString().split('T')[0];
    }

    const order = await RadiologyOrder.create(data);

    await logTraceabilityEvent({
      patientId: order.patientId,
      patientName: order.patientName,
      type: 'RADIOLOGY_ORDERED',
      department: 'Radiology',
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: 'DOCTOR',
      description: `Radiology order ${order.modality} (${order.bodyPart}) created`,
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

    const order = await RadiologyOrder.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }] },
      updates,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Radiology order not found' });
    }

    if (updates.status === 'Scan Completed' || updates.status === 'Verified') {
      await logTraceabilityEvent({
        patientId: order.patientId,
        patientName: order.patientName,
        type: 'RADIOLOGY_COMPLETED',
        department: 'Radiology',
        performedBy: req.user ? req.user.fullName : 'Radiologist',
        role: 'RADIOLOGY',
        description: `Radiology scan completed for ${order.modality} ${order.bodyPart}`,
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
    const orders = await RadiologyOrder.find({ patientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

