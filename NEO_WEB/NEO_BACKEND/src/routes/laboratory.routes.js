const express = require('express');
const { getOrders, createOrder, updateOrder, getOrdersByPatient } = require('../controllers/laboratory.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/lab/orders
router.get('/orders', getOrders);

// POST /api/lab/orders
router.post('/orders', authorize('super_admin', 'admin', 'doctor', 'lab_technician', 'lab'), createOrder);

// GET /api/lab/orders/:id
router.get('/orders/:id', getOrders); // wait, getOrders filters by id if query contains it, or we can write a specific getOrderById. Let's make getOrders support it or define standard params. Wait! In laboratoryService.js on the frontend, getOrderById calls `fetch(`${API_BASE_URL}/lab/orders/${id}`).
// Let's verify what updateOrder does. It handles the ID path too. Let's map GET /orders/:id to a simple check or updateOrder, or let's write a getOrderById handler in laboratory.controller.js.
// Wait, we can implement GET /orders/:id using a simple lookup:
router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { LabOrder } = require('../models/Laboratory');
    const order = await LabOrder.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }] });
    if (!order) return res.status(404).json({ success: false, message: 'Lab order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// PUT /api/lab/orders/:id
router.put('/orders/:id', authorize('super_admin', 'admin', 'lab_technician', 'lab', 'doctor'), updateOrder);

// GET /api/lab/patient/:patientId
router.get('/patient/:patientId', getOrdersByPatient);

module.exports = router;
