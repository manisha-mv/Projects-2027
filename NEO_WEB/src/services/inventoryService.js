// services/inventoryService.js
// Pharmacy Inventory — medicines, stock, batches — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_inventory_v1';
const token = () => localStorage.getItem('neohms_token');

const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };

const SEED = [
  {
    "id": "MED-001",
    "name": "Telmisartan 40mg",
    "category": "Cardiovascular",
    "manufacturer": "Cipla Ltd",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260111",
    "quantity": 50,
    "minStock": 40,
    "unitPrice": 5,
    "mrp": 10,
    "expiryDate": "2027-06-30",
    "location": "Shelf 1-1",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-002",
    "name": "Amlodipine 5mg",
    "category": "Cardiovascular",
    "manufacturer": "Sun Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260211",
    "quantity": 70,
    "minStock": 40,
    "unitPrice": 7,
    "mrp": 13,
    "expiryDate": "2027-06-30",
    "location": "Shelf 2-2",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-003",
    "name": "Metformin 500mg",
    "category": "Antidiabetic",
    "manufacturer": "Mankind Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260311",
    "quantity": 90,
    "minStock": 40,
    "unitPrice": 9,
    "mrp": 16,
    "expiryDate": "2027-06-30",
    "location": "Shelf 3-3",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-004",
    "name": "Salbutamol Inhaler 100mcg",
    "category": "Respiratory",
    "manufacturer": "GSK",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260411",
    "quantity": 110,
    "minStock": 40,
    "unitPrice": 11,
    "mrp": 19,
    "expiryDate": "2027-06-30",
    "location": "Shelf 4-4",
    "unit": "Inhaler",
    "status": "In Stock"
  },
  {
    "id": "MED-005",
    "name": "Sumatriptan 50mg",
    "category": "Neurology",
    "manufacturer": "Dr. Reddys",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260511",
    "quantity": 130,
    "minStock": 40,
    "unitPrice": 13,
    "mrp": 22,
    "expiryDate": "2027-06-30",
    "location": "Shelf 5-5",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-006",
    "name": "Ondansetron 4mg Inj",
    "category": "Antiemetic",
    "manufacturer": "Cipla Ltd",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260611",
    "quantity": 150,
    "minStock": 40,
    "unitPrice": 15,
    "mrp": 25,
    "expiryDate": "2027-06-30",
    "location": "Shelf 1-6",
    "unit": "Vials",
    "status": "In Stock"
  },
  {
    "id": "MED-007",
    "name": "Paracetamol 500mg",
    "category": "Analgesic",
    "manufacturer": "Sun Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260711",
    "quantity": 170,
    "minStock": 40,
    "unitPrice": 17,
    "mrp": 28,
    "expiryDate": "2027-06-30",
    "location": "Shelf 2-7",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-008",
    "name": "Ceftriaxone 1g Inj",
    "category": "Antibiotic",
    "manufacturer": "Mankind Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260811",
    "quantity": 190,
    "minStock": 40,
    "unitPrice": 19,
    "mrp": 31,
    "expiryDate": "2027-06-30",
    "location": "Shelf 3-8",
    "unit": "Vials",
    "status": "In Stock"
  },
  {
    "id": "MED-009",
    "name": "Folic Acid 5mg",
    "category": "Vitamins",
    "manufacturer": "GSK",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260911",
    "quantity": 210,
    "minStock": 40,
    "unitPrice": 21,
    "mrp": 34,
    "expiryDate": "2027-06-30",
    "location": "Shelf 4-9",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-010",
    "name": "Atorvastatin 20mg",
    "category": "Cardiovascular",
    "manufacturer": "Dr. Reddys",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260111",
    "quantity": 230,
    "minStock": 40,
    "unitPrice": 23,
    "mrp": 37,
    "expiryDate": "2027-06-30",
    "location": "Shelf 5-10",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-011",
    "name": "Pantoprazole 40mg",
    "category": "Gastroenterology",
    "manufacturer": "Cipla Ltd",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260211",
    "quantity": 250,
    "minStock": 40,
    "unitPrice": 25,
    "mrp": 40,
    "expiryDate": "2027-06-30",
    "location": "Shelf 1-11",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-012",
    "name": "Amoxicillin 500mg",
    "category": "Antibiotic",
    "manufacturer": "Sun Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260311",
    "quantity": 270,
    "minStock": 40,
    "unitPrice": 27,
    "mrp": 43,
    "expiryDate": "2027-06-30",
    "location": "Shelf 2-12",
    "unit": "Capsules",
    "status": "In Stock"
  },
  {
    "id": "MED-013",
    "name": "Azithromycin 500mg",
    "category": "Antibiotic",
    "manufacturer": "Mankind Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260411",
    "quantity": 290,
    "minStock": 40,
    "unitPrice": 29,
    "mrp": 46,
    "expiryDate": "2027-06-30",
    "location": "Shelf 3-13",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-014",
    "name": "Insulin Regular 100IU",
    "category": "Antidiabetic",
    "manufacturer": "GSK",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260511",
    "quantity": 310,
    "minStock": 40,
    "unitPrice": 31,
    "mrp": 49,
    "expiryDate": "2027-06-30",
    "location": "Shelf 4-14",
    "unit": "Vials",
    "status": "In Stock"
  },
  {
    "id": "MED-015",
    "name": "Levothyroxine 50mcg",
    "category": "Endocrinology",
    "manufacturer": "Dr. Reddys",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260611",
    "quantity": 330,
    "minStock": 40,
    "unitPrice": 33,
    "mrp": 52,
    "expiryDate": "2027-06-30",
    "location": "Shelf 5-15",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-016",
    "name": "Heparin 5000IU Inj",
    "category": "Anticoagulant",
    "manufacturer": "Cipla Ltd",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260711",
    "quantity": 350,
    "minStock": 40,
    "unitPrice": 35,
    "mrp": 55,
    "expiryDate": "2027-06-30",
    "location": "Shelf 1-16",
    "unit": "Vials",
    "status": "In Stock"
  },
  {
    "id": "MED-017",
    "name": "Clopidogrel 75mg",
    "category": "Cardiovascular",
    "manufacturer": "Sun Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260811",
    "quantity": 370,
    "minStock": 40,
    "unitPrice": 37,
    "mrp": 58,
    "expiryDate": "2027-06-30",
    "location": "Shelf 2-17",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-018",
    "name": "Tramadol 50mg Inj",
    "category": "Analgesic",
    "manufacturer": "Mankind Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260911",
    "quantity": 390,
    "minStock": 40,
    "unitPrice": 39,
    "mrp": 61,
    "expiryDate": "2027-06-30",
    "location": "Shelf 3-18",
    "unit": "Ampoules",
    "status": "In Stock"
  },
  {
    "id": "MED-019",
    "name": "Deriphyllin 150mg",
    "category": "Respiratory",
    "manufacturer": "GSK",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260111",
    "quantity": 410,
    "minStock": 40,
    "unitPrice": 41,
    "mrp": 64,
    "expiryDate": "2027-06-30",
    "location": "Shelf 4-19",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-020",
    "name": "Hydrocortisone 100mg Inj",
    "category": "Steroids",
    "manufacturer": "Dr. Reddys",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260211",
    "quantity": 430,
    "minStock": 40,
    "unitPrice": 43,
    "mrp": 67,
    "expiryDate": "2027-06-30",
    "location": "Shelf 5-20",
    "unit": "Vials",
    "status": "In Stock"
  },
  {
    "id": "MED-021",
    "name": "Budesonide Inhaler 200mcg",
    "category": "Respiratory",
    "manufacturer": "Cipla Ltd",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260311",
    "quantity": 450,
    "minStock": 40,
    "unitPrice": 45,
    "mrp": 70,
    "expiryDate": "2027-06-30",
    "location": "Shelf 1-21",
    "unit": "Inhaler",
    "status": "In Stock"
  },
  {
    "id": "MED-022",
    "name": "Enoxaparin 40mg Inj",
    "category": "Anticoagulant",
    "manufacturer": "Sun Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260411",
    "quantity": 470,
    "minStock": 40,
    "unitPrice": 47,
    "mrp": 73,
    "expiryDate": "2027-06-30",
    "location": "Shelf 2-22",
    "unit": "Syringes",
    "status": "In Stock"
  },
  {
    "id": "MED-023",
    "name": "Metoprolol 25mg",
    "category": "Cardiovascular",
    "manufacturer": "Mankind Pharma",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260511",
    "quantity": 490,
    "minStock": 40,
    "unitPrice": 49,
    "mrp": 76,
    "expiryDate": "2027-06-30",
    "location": "Shelf 3-23",
    "unit": "Tablets",
    "status": "In Stock"
  },
  {
    "id": "MED-024",
    "name": "Furosemide 40mg Inj",
    "category": "Diuretics",
    "manufacturer": "GSK",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260611",
    "quantity": 510,
    "minStock": 40,
    "unitPrice": 51,
    "mrp": 79,
    "expiryDate": "2027-06-30",
    "location": "Shelf 4-24",
    "unit": "Ampoules",
    "status": "In Stock"
  },
  {
    "id": "MED-025",
    "name": "Levetiracetam 500mg",
    "category": "Neurology",
    "manufacturer": "Dr. Reddys",
    "supplier": "MedLine Pharma Dist",
    "batchNo": "B20260711",
    "quantity": 530,
    "minStock": 40,
    "unitPrice": 53,
    "mrp": 82,
    "expiryDate": "2027-06-30",
    "location": "Shelf 5-25",
    "unit": "Tablets",
    "status": "In Stock"
  }
];

const getLocal = () => { try { const d = localStorage.getItem(STORE_KEY); if (d) { const parsed = JSON.parse(d); if (Array.isArray(parsed) && parsed.length >= 20) return parsed; } } catch { /* */ } localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED; };
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
