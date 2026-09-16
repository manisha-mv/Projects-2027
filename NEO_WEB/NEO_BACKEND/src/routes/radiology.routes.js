const express = require('express');
const { getOrders, createOrder, updateOrder, getOrdersByPatient } = require('../controllers/radiology.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/radiology/orders
router.get('/orders', getOrders);

// POST /api/radiology/orders
router.post('/orders', authorize('super_admin', 'admin', 'doctor', 'radiologist', 'radiology'), createOrder);

// PUT /api/radiology/orders/:id/schedule
router.put('/orders/:id/schedule', authorize('super_admin', 'admin', 'radiologist', 'radiology'), updateOrder);

// PUT /api/radiology/orders/:id
router.put('/orders/:id', authorize('super_admin', 'admin', 'radiologist', 'radiology', 'doctor'), updateOrder);

// GET /api/radiology/patient/:patientId
router.get('/patient/:patientId', getOrdersByPatient);

module.exports = router;
