const express = require('express');
const { getInvoices, getInvoiceById, createInvoice, processPayment } = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', authorize('super_admin', 'admin', 'billing', 'receptionist'), createInvoice);

// Payments
router.post('/payments', authorize('super_admin', 'admin', 'billing', 'receptionist'), processPayment);

module.exports = router;
