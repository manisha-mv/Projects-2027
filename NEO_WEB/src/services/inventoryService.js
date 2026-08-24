// services/inventoryService.js
// Pharmacy Inventory — medicines, stock, batches — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_inventory_v1';
const token = () => localStorage.getItem('neohms_token');

const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };

const SEED = [
  { id: 'MED-001', name: 'Telmisartan 40mg', category: 'Cardiovascular', manufacturer: 'Cipla Ltd', supplier: 'MedLine Pharma', batchNo: 'B20260811', quantity: 250, minStock: 50, unitPrice: 8.50, mrp: 12.00, expiryDate: futureDate(300), location: 'Shelf A-12', unit: 'Tablets', status: 'In Stock' },
  { id: 'MED-002', name: 'Amlodipine 5mg', category: 'Cardiovascular', manufacturer: 'Sun Pharma', supplier: 'MedLine Pharma', batchNo: 'B20260709', quantity: 180, minStock: 50, unitPrice: 4.20, mrp: 7.00, expiryDate: futureDate(180), location: 'Shelf A-13', unit: 'Tablets', status: 'In Stock' },
  { id: 'MED-003', name: 'Metformin 500mg', category: 'Antidiabetic', manufacturer: 'Mankind Pharma', supplier: 'HealthPlus Dist', batchNo: 'B20260602', quantity: 42, minStock: 100, unitPrice: 3.10, mrp: 5.50, expiryDate: futureDate(240), location: 'Shelf B-01', unit: 'Tablets', status: 'Low Stock' },
  { id: 'MED-004', name: 'Salbutamol Inhaler 100mcg', category: 'Respiratory', manufacturer: 'GSK', supplier: 'Global Pharma', batchNo: 'B20261001', quantity: 35, minStock: 20, unitPrice: 85.00, mrp: 120.00, expiryDate: futureDate(400), location: 'Shelf C-05', unit: 'Inhaler', status: 'In Stock' },
  { id: 'MED-005', name: 'Sumatriptan 50mg', category: 'Neurology', manufacturer: 'Dr. Reddys', supplier: 'MedLine Pharma', batchNo: 'B20260501', quantity: 18, minStock: 30, unitPrice: 28.00, mrp: 45.00, expiryDate: futureDate(160), location: 'Shelf D-03', unit: 'Tablets', status: 'Low Stock' },
  { id: 'MED-006', name: 'Ondansetron 4mg Inj', category: 'Antiemetic', manufacturer: 'Neon Labs', supplier: 'HealthPlus Dist', batchNo: 'B20260815', quantity: 120, minStock: 30, unitPrice: 14.50, mrp: 22.00, expiryDate: futureDate(200), location: 'Injection Store', unit: 'Vials', status: 'In Stock' },
  { id: 'MED-007', name: 'Paracetamol 500mg', category: 'Analgesic', manufacturer: 'Cipla Ltd', supplier: 'MedLine Pharma', batchNo: 'B20260303', quantity: 5, minStock: 200, unitPrice: 1.20, mrp: 2.50, expiryDate: futureDate(-15), location: 'Shelf A-01', unit: 'Tablets', status: 'Expired' },
  { id: 'MED-008', name: 'Ceftriaxone 1g Inj', category: 'Antibiotic', manufacturer: 'Alkem Labs', supplier: 'Global Pharma', batchNo: 'B20260720', quantity: 60, minStock: 20, unitPrice: 45.00, mrp: 75.00, expiryDate: futureDate(120), location: 'Injection Store', unit: 'Vials', status: 'In Stock' },
  { id: 'MED-009', name: 'Folic Acid 5mg', category: 'Vitamins', manufacturer: 'Mankind Pharma', supplier: 'HealthPlus Dist', batchNo: 'B20261102', quantity: 500, minStock: 100, unitPrice: 0.80, mrp: 2.00, expiryDate: futureDate(500), location: 'Shelf E-01', unit: 'Tablets', status: 'In Stock' },
  { id: 'MED-010', name: 'Atorvastatin 20mg', category: 'Cardiovascular', manufacturer: 'Pfizer', supplier: 'MedLine Pharma', batchNo: 'B20260610', quantity: 300, minStock: 80, unitPrice: 9.50, mrp: 16.00, expiryDate: futureDate(260), location: 'Shelf A-14', unit: 'Tablets', status: 'In Stock' },
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
const saveLocal = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const inventoryService = {
  async getMedicines(params = {}) {
    const { search = '', category = '', status = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, category, status, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/pharmacy/inventory?${q}`, { headers: h() });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { medicines: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; }
    } catch { /* */ }
    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(m => m.name?.toLowerCase().includes(q) || m.batchNo?.toLowerCase().includes(q)); }
    if (category && category !== 'All') list = list.filter(m => m.category === category);
    if (status && status !== 'All') list = list.filter(m => m.status === status);
    const total = list.length;
    return { medicines: list.slice((page - 1) * limit, page * limit), total, isLiveApi: false };
  },

  async updateStock(id, quantityChange, notes = '') {
    const list = getLocal(); const idx = list.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    try {
      const res = await fetch(`${API_BASE_URL}/pharmacy/inventory/${id}/stock`, { method: 'POST', headers: h(), body: JSON.stringify({ quantityChange, notes }) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, medicine: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    const newQty = Math.max(0, list[idx].quantity + quantityChange);
    let status = 'In Stock';
    if (new Date(list[idx].expiryDate) < new Date()) status = 'Expired';
    else if (newQty <= list[idx].minStock) status = 'Low Stock';
    list[idx] = { ...list[idx], quantity: newQty, status };
    saveLocal(list);
    return { success: true, medicine: list[idx], isLiveApi: false };
  },

  async addMedicine(data) {
    const list = getLocal();
    const id = `MED-${String(list.length + 1).padStart(3, '0')}`;
    const qty = data.quantity || 0;
    const min = data.minStock || 50;
    let status = 'In Stock';
    if (data.expiryDate && new Date(data.expiryDate) < new Date()) status = 'Expired';
    else if (qty <= min) status = 'Low Stock';
    const record = { id, ...data, status };
    try {
      const res = await fetch(`${API_BASE_URL}/pharmacy/inventory`, { method: 'POST', headers: h(), body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, medicine: d.data, isLiveApi: true }; } }
    } catch { /* */ }
    list.unshift(record); saveLocal(list);
    return { success: true, medicine: record, isLiveApi: false };
  },

  getLowStockMedicines() { return getLocal().filter(m => m.status === 'Low Stock'); },
  getExpiredMedicines()  { return getLocal().filter(m => m.status === 'Expired'); },
  getCategories() { return [...new Set(getLocal().map(m => m.category))]; },
};

export default inventoryService;
