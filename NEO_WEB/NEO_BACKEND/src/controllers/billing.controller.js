// src/controllers/billing.controller.js
const Invoice = require('../models/Billing');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getInvoices = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { invoiceId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: invoices,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { invoiceId: id }],
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.invoiceId) {
      const count = await Invoice.countDocuments();
      data.invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    // BACKEND TOTAL CALCULATION (Security: Never trust totals from frontend)
    const items = data.items || [];
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.qty || 1) * parseFloat(item.rate || 0)), 0);
    const discount = parseFloat(data.discount || 0);
    const tax = parseFloat(data.tax || 0);
    const total = subtotal - discount + tax;

    data.subtotal = subtotal;
    data.total = total;
    data.paid = 0;
    data.balance = total;
    data.status = 'Issued';
    if (!data.invoiceDate) data.invoiceDate = new Date().toISOString().split('T')[0];

    const invoice = await Invoice.create(data);

    await logTraceabilityEvent({
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      type: 'BILL_CREATED',
      department: 'Finance & Billing',
      performedBy: req.user ? req.user.fullName : 'Billing Staff',
      role: 'BILLING',
      description: `Invoice ${invoice.invoiceId} generated for ₹${invoice.total}`,
      relatedId: invoice.invoiceId,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, method } = req.body;
    const paymentAmount = parseFloat(amount || 0);

    const invoice = await Invoice.findOne({
      $or: [{ _id: invoiceId.match(/^[0-9a-fA-F]{24}$/) ? invoiceId : null }, { invoiceId: invoiceId }],
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // BACKEND PAYMENT COMPUTATION
    const newPaid = invoice.paid + paymentAmount;
    const newBalance = Math.max(0, invoice.total - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

    invoice.paid = newPaid;
    invoice.balance = newBalance;
    invoice.status = newStatus;
    invoice.paymentMethod = method || invoice.paymentMethod;

    await invoice.save();

    await logTraceabilityEvent({
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      type: 'PAYMENT_COMPLETED',
      department: 'Finance & Billing',
      performedBy: req.user ? req.user.fullName : 'Billing Staff',
      role: 'BILLING',
      status: newStatus,
      description: `Payment of ₹${paymentAmount} received via ${method}`,
      relatedId: invoice.invoiceId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Payment',
      module: 'Billing',
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      description: `Processed ₹${paymentAmount} payment for invoice ${invoice.invoiceId}`,
    });

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};
