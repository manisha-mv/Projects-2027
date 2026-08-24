// services/billingService.js
// Billing & Finance — invoices, payments, receipts — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const INV_KEY = 'neo_hms_invoices_v1';
const PAY_KEY = 'neo_hms_payments_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Insurance', 'Cheque'];
export const INVOICE_STATUSES = ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

const SEED_INVOICES = [
  { id: 'INV-2026-001', invoiceId: 'INV-2026-001', patientId: 'P10025', patientName: 'Arun Kumar', invoiceDate: today, dueDate: today, items: [{ description: 'Consultation Fee', qty: 1, rate: 600, total: 600 }, { description: 'Room Charges (General Ward × 2 days)', qty: 2, rate: 800, total: 1600 }, { description: 'Pharmacy', qty: 1, rate: 340, total: 340 }, { description: 'Lab Tests', qty: 2, rate: 250, total: 500 }], subtotal: 3040, tax: 0, discount: 0, total: 3040, paid: 2000, balance: 1040, status: 'Partially Paid', paymentMethod: 'Cash', notes: '' },
  { id: 'INV-2026-002', invoiceId: 'INV-2026-002', patientId: 'P10033', patientName: 'Sunita Iyer', invoiceDate: today, dueDate: today, items: [{ description: 'Cardiology Consultation', qty: 1, rate: 1500, total: 1500 }, { description: 'ICU Charges (× 3 days)', qty: 3, rate: 4000, total: 12000 }, { description: 'Angioplasty Procedure', qty: 1, rate: 120000, total: 120000 }, { description: 'Medicines', qty: 1, rate: 8500, total: 8500 }], subtotal: 142000, tax: 0, discount: 0, total: 142000, paid: 0, balance: 142000, status: 'Issued', paymentMethod: null, notes: 'Insurance claim pending — TPA Approval awaited' },
  { id: 'INV-2026-003', invoiceId: 'INV-2026-003', patientId: 'P10011', patientName: 'Kavitha Rao', invoiceDate: today, dueDate: today, items: [{ description: 'Consultation', qty: 1, rate: 600, total: 600 }, { description: 'Room Charges (2 days)', qty: 2, rate: 800, total: 1600 }, { description: 'Medicines', qty: 1, rate: 450, total: 450 }], subtotal: 2650, tax: 0, discount: 0, total: 2650, paid: 2650, balance: 0, status: 'Paid', paymentMethod: 'UPI', notes: 'Cleared at discharge' },
  { id: 'INV-2026-004', invoiceId: 'INV-2026-004', patientId: 'P10052', patientName: 'Mohammed Aslam', invoiceDate: today, dueDate: today, items: [{ description: 'OPD Consultation', qty: 1, rate: 500, total: 500 }, { description: 'Pharmacy', qty: 1, rate: 250, total: 250 }], subtotal: 750, tax: 0, discount: 0, total: 750, paid: 750, balance: 0, status: 'Paid', paymentMethod: 'Cash', notes: '' },
];

const getL = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveL = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const billingService = {
  async getInvoices(params = {}) {
    const { search = '', status = '', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, status, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/billing/invoices?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { invoices: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getL(INV_KEY, SEED_INVOICES);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(i => i.patientName?.toLowerCase().includes(q) || i.invoiceId?.toLowerCase().includes(q)); }
    if (status && status !== 'All') list = list.filter(i => i.status === status);
    return { invoices: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async getInvoiceById(id) {
    try { const res = await fetch(`${API_BASE_URL}/billing/invoices/${id}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { invoice: d.data, isLiveApi: true }; } } catch { /* */ }
    const list = getL(INV_KEY, SEED_INVOICES);
    const inv = list.find(i => i.id === id || i.invoiceId === id);
    return inv ? { invoice: inv, isLiveApi: false } : null;
  },

  async createInvoice(data) {
    const list = getL(INV_KEY, SEED_INVOICES);
    const id = `INV-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const subtotal = data.items?.reduce((s, i) => s + (i.total || 0), 0) || 0;
    const total = subtotal - (data.discount || 0) + (data.tax || 0);
    const record = { id, invoiceId: id, ...data, subtotal, total, paid: 0, balance: total, status: 'Issued', invoiceDate: new Date().toISOString().split('T')[0] };
    try { const res = await fetch(`${API_BASE_URL}/billing/invoices`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveL(INV_KEY, list); return { success: true, invoice: d.data, isLiveApi: true }; } } } catch { /* */ }
    list.unshift(record); saveL(INV_KEY, list);
    return { success: true, invoice: record, isLiveApi: false };
  },

  async processPayment(invoiceId, amount, method) {
    const list = getL(INV_KEY, SEED_INVOICES);
    const idx = list.findIndex(i => i.id === invoiceId || i.invoiceId === invoiceId);
    if (idx === -1) throw new Error('Invoice not found');
    const newPaid = list[idx].paid + amount;
    const newBalance = Math.max(0, list[idx].total - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';
    try { const res = await fetch(`${API_BASE_URL}/billing/payments`, { method: 'POST', headers: h(), body: JSON.stringify({ invoiceId, amount, method }) }); if (res.ok) { const d = await res.json(); if (d.success) { list[idx] = { ...list[idx], paid: newPaid, balance: newBalance, status: newStatus, paymentMethod: method }; saveL(INV_KEY, list); return { success: true, invoice: list[idx], isLiveApi: true }; } } } catch { /* */ }
    list[idx] = { ...list[idx], paid: newPaid, balance: newBalance, status: newStatus, paymentMethod: method };
    saveL(INV_KEY, list);
    return { success: true, invoice: list[idx], isLiveApi: false };
  },

  getDashboardStats() {
    const list = getL(INV_KEY, SEED_INVOICES);
    return {
      totalRevenue: list.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
      pendingAmount: list.filter(i => ['Issued', 'Partially Paid', 'Overdue'].includes(i.status)).reduce((s, i) => s + i.balance, 0),
      totalInvoices: list.length,
      paidInvoices: list.filter(i => i.status === 'Paid').length,
    };
  },
};

export default billingService;
