// services/ipdService.js
// IPD / Inpatient — beds, admissions, transfers — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const ADM_KEY  = 'neo_hms_ipd_admissions_v1';
const BED_KEY  = 'neo_hms_ipd_beds_v1';
const token = () => localStorage.getItem('neohms_token');

const today = new Date().toISOString().split('T')[0];
export const WARD_TYPES = ['General Ward', 'Cardiology ICU', 'Neurology', 'Maternity', 'Orthopaedics', 'Paediatrics', 'Emergency', 'Surgical ICU'];

const SEED_BEDS = [
  { id: 'GW-01', bedId: 'GW-01', ward: 'General Ward', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'GW-02', bedId: 'GW-02', ward: 'General Ward', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'GW-03', bedId: 'GW-03', ward: 'General Ward', type: 'Standard', status: 'Maintenance', patientId: null, patientName: null },
  { id: 'GW-04', bedId: 'GW-04', ward: 'General Ward', type: 'Standard', status: 'Occupied', patientId: 'P10025', patientName: 'Arun Kumar' },
  { id: 'CAR-01', bedId: 'CAR-01', ward: 'Cardiology ICU', type: 'ICU', status: 'Available', patientId: null, patientName: null },
  { id: 'CAR-02', bedId: 'CAR-02', ward: 'Cardiology ICU', type: 'ICU', status: 'Occupied', patientId: 'P10033', patientName: 'Sunita Iyer' },
  { id: 'NEU-07', bedId: 'NEU-07', ward: 'Neurology', type: 'Standard', status: 'Occupied', patientId: 'P10047', patientName: 'Prakash Nair' },
  { id: 'NEU-08', bedId: 'NEU-08', ward: 'Neurology', type: 'Standard', status: 'Available', patientId: null, patientName: null },
  { id: 'MAT-03', bedId: 'MAT-03', ward: 'Maternity', type: 'Maternity', status: 'Occupied', patientId: 'P10055', patientName: 'Fatima Begum' },
  { id: 'ORT-11', bedId: 'ORT-11', ward: 'Orthopaedics', type: 'Standard', status: 'Occupied', patientId: 'P10062', patientName: 'Rajesh Varma' },
  { id: 'E-07', bedId: 'E-07', ward: 'Emergency', type: 'Emergency', status: 'Occupied', patientId: 'P10069', patientName: 'Deepa Thomas' },
  { id: 'E-08', bedId: 'E-08', ward: 'Emergency', type: 'Emergency', status: 'Available', patientId: null, patientName: null },
];

const SEED_ADMISSIONS = [
  { id: 'ADM-001', admissionId: 'ADM-001', patientId: 'P10025', patientName: 'Arun Kumar', bedId: 'GW-04', ward: 'General Ward', admitDate: today, admitTime: '08:00', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', diagnosis: 'Hypertension', nurseAssigned: 'Nurse A', status: 'Active', condition: 'Stable', notes: '' },
  { id: 'ADM-002', admissionId: 'ADM-002', patientId: 'P10033', patientName: 'Sunita Iyer', bedId: 'CAR-02', ward: 'Cardiology ICU', admitDate: today, admitTime: '07:30', doctorId: 'D002', doctorName: 'Dr. Kiran Rao', diagnosis: 'AMI — Post-Stent', nurseAssigned: 'Nurse B', status: 'Active', condition: 'Serious', notes: 'Post-procedure monitoring' },
  { id: 'ADM-003', admissionId: 'ADM-003', patientId: 'P10047', patientName: 'Prakash Nair', bedId: 'NEU-07', ward: 'Neurology', admitDate: today, admitTime: '09:15', doctorId: 'D003', doctorName: 'Dr. Ananya Menon', diagnosis: 'Chronic Migraine — Acute', nurseAssigned: 'Nurse C', status: 'Active', condition: 'Stable', notes: '' },
  { id: 'ADM-004', admissionId: 'ADM-004', patientId: 'P10062', patientName: 'Rajesh Varma', bedId: 'ORT-11', ward: 'Orthopaedics', admitDate: today, admitTime: '06:00', doctorId: 'D005', doctorName: 'Dr. Suresh Bhat', diagnosis: 'Post Hip Replacement', nurseAssigned: 'Nurse D', status: 'Active', condition: 'Recovering', notes: 'Day 4 post-op' },
  { id: 'ADM-005', admissionId: 'ADM-005', patientId: 'P10069', patientName: 'Deepa Thomas', bedId: 'E-07', ward: 'Emergency', admitDate: today, admitTime: '08:30', doctorId: 'D001', doctorName: 'Dr. Priya Sharma', diagnosis: 'Acute Appendicitis', nurseAssigned: 'Nurse A', status: 'Active', condition: 'Critical', notes: 'Emergency admission' },
];

const getL = (key, seed) => { try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch { /* */ } localStorage.setItem(key, JSON.stringify(seed)); return seed; };
const saveL = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ } };
const h = () => ({ 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

export const ipdService = {
  async getAdmissions(params = {}) {
    const { search = '', ward = '', status = 'Active', page = 1, limit = 20 } = params;
    try { const q = new URLSearchParams({ search, ward, status, page, limit }).toString(); const res = await fetch(`${API_BASE_URL}/ipd/admissions?${q}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { admissions: d.data, total: d.pagination?.total || d.data.length, isLiveApi: true }; } } catch { /* */ }
    let list = getL(ADM_KEY, SEED_ADMISSIONS);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(a => a.patientName?.toLowerCase().includes(q) || a.patientId?.toLowerCase().includes(q)); }
    if (ward && ward !== 'All') list = list.filter(a => a.ward === ward);
    if (status && status !== 'All') list = list.filter(a => a.status === status);
    return { admissions: list.slice((page - 1) * limit, page * limit), total: list.length, isLiveApi: false };
  },

  async getBeds(ward = '') {
    try { const res = await fetch(`${API_BASE_URL}/ipd/beds${ward ? `?ward=${ward}` : ''}`, { headers: h() }); if (res.ok) { const d = await res.json(); if (d.success && d.data) return { beds: d.data, isLiveApi: true }; } } catch { /* */ }
    let list = getL(BED_KEY, SEED_BEDS);
    if (ward) list = list.filter(b => b.ward === ward);
    const stats = { total: list.length, available: list.filter(b => b.status === 'Available').length, occupied: list.filter(b => b.status === 'Occupied').length, maintenance: list.filter(b => b.status === 'Maintenance').length };
    return { beds: list, stats, isLiveApi: false };
  },

  async admitPatient(data) {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const id = `ADM-${String(admissions.length + 1).padStart(3, '0')}`;
    const record = { id, admissionId: id, ...data, admitDate: new Date().toISOString().split('T')[0], admitTime: new Date().toTimeString().slice(0, 5), status: 'Active' };
    try { const res = await fetch(`${API_BASE_URL}/ipd/admissions`, { method: 'POST', headers: h(), body: JSON.stringify(data) }); if (res.ok) { const d = await res.json(); if (d.success && d.data) { admissions.unshift(d.data); saveL(ADM_KEY, admissions); return { success: true, admission: d.data, isLiveApi: true }; } } } catch { /* */ }
    admissions.unshift(record);
    const bedIdx = beds.findIndex(b => b.id === data.bedId);
    if (bedIdx !== -1) { beds[bedIdx] = { ...beds[bedIdx], status: 'Occupied', patientId: data.patientId, patientName: data.patientName }; saveL(BED_KEY, beds); }
    saveL(ADM_KEY, admissions);
    return { success: true, admission: record, isLiveApi: false };
  },

  async transferPatient(admissionId, newBedId, notes = '') {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const idx = admissions.findIndex(a => a.id === admissionId);
    if (idx === -1) throw new Error('Admission not found');
    try { const res = await fetch(`${API_BASE_URL}/ipd/admissions/${admissionId}/transfer`, { method: 'PUT', headers: h(), body: JSON.stringify({ newBedId, notes }) }); if (res.ok) { const d = await res.json(); if (d.success) { admissions[idx] = d.data; saveL(ADM_KEY, admissions); return { success: true, isLiveApi: true }; } } } catch { /* */ }
    const oldBedIdx = beds.findIndex(b => b.id === admissions[idx].bedId);
    const newBedIdx = beds.findIndex(b => b.id === newBedId);
    if (oldBedIdx !== -1) beds[oldBedIdx] = { ...beds[oldBedIdx], status: 'Available', patientId: null, patientName: null };
    if (newBedIdx !== -1) beds[newBedIdx] = { ...beds[newBedIdx], status: 'Occupied', patientId: admissions[idx].patientId, patientName: admissions[idx].patientName };
    admissions[idx] = { ...admissions[idx], bedId: newBedId, ward: beds[newBedIdx]?.ward || admissions[idx].ward, notes };
    saveL(ADM_KEY, admissions); saveL(BED_KEY, beds);
    return { success: true, isLiveApi: false };
  },

  async dischargePatient(admissionId) {
    const admissions = getL(ADM_KEY, SEED_ADMISSIONS);
    const beds = getL(BED_KEY, SEED_BEDS);
    const idx = admissions.findIndex(a => a.id === admissionId);
    if (idx === -1) throw new Error('Admission not found');
    admissions[idx] = { ...admissions[idx], status: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] };
    const bedIdx = beds.findIndex(b => b.id === admissions[idx].bedId);
    if (bedIdx !== -1) beds[bedIdx] = { ...beds[bedIdx], status: 'Available', patientId: null, patientName: null };
    saveL(ADM_KEY, admissions); saveL(BED_KEY, beds);
    return { success: true, isLiveApi: false };
  },
};

export default ipdService;
