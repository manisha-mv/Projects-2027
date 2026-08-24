// services/doctorService.js
// Doctor management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_doctors_v1';
const token = () => localStorage.getItem('neohms_token');

const SEED = [
  { id: 'D001', doctorId: 'D001', name: 'Dr. Priya Sharma',   firstName: 'Priya',   lastName: 'Sharma',   email: 'priya.sharma@neohms.in',   phone: '+91 98100 11001', department: 'General Medicine',       qualification: 'MBBS, MD',               specialization: 'Internal Medicine', experience: 12, status: 'Active',    joiningDate: '2014-06-01', schedule: 'Mon-Fri 09:00-17:00' },
  { id: 'D002', doctorId: 'D002', name: 'Dr. Kiran Rao',       firstName: 'Kiran',   lastName: 'Rao',      email: 'kiran.rao@neohms.in',       phone: '+91 98100 11002', department: 'Cardiology',             qualification: 'MBBS, DM (Cardiology)', specialization: 'Interventional Cardiology', experience: 18, status: 'Active', joiningDate: '2010-03-15', schedule: 'Mon-Sat 08:00-16:00' },
  { id: 'D003', doctorId: 'D003', name: 'Dr. Ananya Menon',    firstName: 'Ananya',  lastName: 'Menon',    email: 'ananya.menon@neohms.in',    phone: '+91 98100 11003', department: 'Neurology',              qualification: 'MBBS, DM (Neurology)', specialization: 'Epilepsy & Movement Disorders', experience: 10, status: 'Active', joiningDate: '2016-01-10', schedule: 'Mon-Fri 10:00-18:00' },
  { id: 'D004', doctorId: 'D004', name: 'Dr. Rekha Singh',     firstName: 'Rekha',   lastName: 'Singh',    email: 'rekha.singh@neohms.in',     phone: '+91 98100 11004', department: 'Maternity & Gynaecology',qualification: 'MBBS, MS (OBG)',        specialization: 'High-risk Obstetrics', experience: 15, status: 'Active', joiningDate: '2011-08-20', schedule: 'Mon-Sat 09:00-17:00' },
  { id: 'D005', doctorId: 'D005', name: 'Dr. Suresh Bhat',     firstName: 'Suresh',  lastName: 'Bhat',     email: 'suresh.bhat@neohms.in',     phone: '+91 98100 11005', department: 'Orthopaedics',           qualification: 'MBBS, MS (Ortho)',      specialization: 'Joint Replacement', experience: 14, status: 'Active', joiningDate: '2012-04-01', schedule: 'Mon-Fri 09:00-17:00' },
  { id: 'D006', doctorId: 'D006', name: 'Dr. Vikram Nair',     firstName: 'Vikram',  lastName: 'Nair',     email: 'vikram.nair@neohms.in',     phone: '+91 98100 11006', department: 'Paediatrics',            qualification: 'MBBS, DCH, MD',        specialization: 'Neonatology', experience: 9, status: 'Active', joiningDate: '2017-07-15', schedule: 'Mon-Fri 09:00-17:00' },
  { id: 'D007', doctorId: 'D007', name: 'Dr. Leena Joseph',    firstName: 'Leena',   lastName: 'Joseph',   email: 'leena.joseph@neohms.in',    phone: '+91 98100 11007', department: 'Dermatology',            qualification: 'MBBS, DVD, DNB',       specialization: 'Cosmetic Dermatology', experience: 8, status: 'On Leave', joiningDate: '2018-02-10', schedule: 'Tue-Sat 10:00-18:00' },
  { id: 'D008', doctorId: 'D008', name: 'Dr. Arun Krishnan',   firstName: 'Arun',    lastName: 'Krishnan', email: 'arun.krishnan@neohms.in',   phone: '+91 98100 11008', department: 'ENT',                    qualification: 'MBBS, MS (ENT)',        specialization: 'Head & Neck Surgery', experience: 11, status: 'Active', joiningDate: '2015-09-01', schedule: 'Mon-Fri 09:00-17:00' },
  { id: 'D009', doctorId: 'D009', name: 'Dr. Pooja Gupta',     firstName: 'Pooja',   lastName: 'Gupta',    email: 'pooja.gupta@neohms.in',     phone: '+91 98100 11009', department: 'Ophthalmology',          qualification: 'MBBS, DO, DNB',        specialization: 'Retina', experience: 7, status: 'Active', joiningDate: '2019-06-20', schedule: 'Mon-Sat 09:00-16:00' },
  { id: 'D010', doctorId: 'D010', name: 'Dr. Rahul Mehta',     firstName: 'Rahul',   lastName: 'Mehta',    email: 'rahul.mehta@neohms.in',     phone: '+91 98100 11010', department: 'Emergency & Trauma',     qualification: 'MBBS, MD (Emergency)', specialization: 'Emergency Medicine', experience: 6, status: 'Active', joiningDate: '2020-01-15', schedule: 'Rotating Shifts' },
];

const getLocal = () => {
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (d) return JSON.parse(d);
  } catch { /* */ }
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
  return SEED;
};

const saveLocal = (data) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* */ }
};

export const doctorService = {
  async getDoctors(params = {}) {
    const { search = '', department = '', status = '', page = 1, limit = 20 } = params;
    try {
      const q = new URLSearchParams({ search, department, status, page, limit }).toString();
      const res = await fetch(`${API_BASE_URL}/doctors?${q}`, { headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return { doctors: data.data, total: data.pagination?.total || data.data.length, isLiveApi: true };
      }
    } catch { /* fallback */ }

    let list = getLocal();
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(d => d.name?.toLowerCase().includes(q) || d.doctorId?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q)); }
    if (department && department !== 'All') list = list.filter(d => d.department === department);
    if (status && status !== 'All') list = list.filter(d => d.status === status);
    const total = list.length;
    const start = (page - 1) * limit;
    return { doctors: list.slice(start, start + limit), total, page, pages: Math.ceil(total / limit), isLiveApi: false };
  },

  async getDoctorById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) return { doctor: d.data, isLiveApi: true }; }
    } catch { /* fallback */ }
    const list = getLocal();
    const doctor = list.find(d => d.id === id || d.doctorId === id);
    return doctor ? { doctor, isLiveApi: false } : null;
  },

  async createDoctor(data) {
    const list = getLocal();
    const id = `D${String(list.length + 1).padStart(3, '0')}`;
    const record = { id, doctorId: id, ...data, status: data.status || 'Active' };
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) }, body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list.unshift(d.data); saveLocal(list); return { success: true, doctor: d.data, isLiveApi: true }; } }
    } catch { /* fallback */ }
    list.unshift(record); saveLocal(list);
    return { success: true, doctor: record, isLiveApi: false };
  },

  async updateDoctor(id, data) {
    const list = getLocal();
    const idx = list.findIndex(d => d.id === id || d.doctorId === id);
    if (idx === -1) throw new Error('Doctor not found');
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) }, body: JSON.stringify(data) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { list[idx] = d.data; saveLocal(list); return { success: true, doctor: d.data, isLiveApi: true }; } }
    } catch { /* fallback */ }
    list[idx] = { ...list[idx], ...data };
    saveLocal(list);
    return { success: true, doctor: list[idx], isLiveApi: false };
  },
};

export default doctorService;
