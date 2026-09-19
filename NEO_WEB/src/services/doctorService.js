// services/doctorService.js
// Doctor management — API-first with localStorage fallback

import { API_BASE_URL } from '../lib/apiClient';
const STORE_KEY = 'neo_hms_doctors_v1';
const token = () => localStorage.getItem('neohms_token');

const SEED = [
  {
    "id": "D001",
    "doctorId": "D001",
    "name": "Dr. Priya Sharma",
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": ".priya.sharma@neohms.in",
    "phone": "+91 98100 11001",
    "department": "General Medicine",
    "qualification": "MBBS, MD",
    "specialization": "Internal Medicine",
    "experience": 6,
    "status": "Active",
    "joiningDate": "2011-01-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D002",
    "doctorId": "D002",
    "name": "Dr. Kiran Rao",
    "firstName": "Kiran",
    "lastName": "Rao",
    "email": ".kiran.rao@neohms.in",
    "phone": "+91 98100 11002",
    "department": "Cardiology",
    "qualification": "MBBS, DM (Cardiology)",
    "specialization": "Interventional Cardiology",
    "experience": 7,
    "status": "Active",
    "joiningDate": "2012-02-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D003",
    "doctorId": "D003",
    "name": "Dr. Ananya Menon",
    "firstName": "Ananya",
    "lastName": "Menon",
    "email": ".ananya.menon@neohms.in",
    "phone": "+91 98100 11003",
    "department": "Neurology",
    "qualification": "MBBS, DM (Neurology)",
    "specialization": "Epilepsy & Movement Disorders",
    "experience": 8,
    "status": "Active",
    "joiningDate": "2013-03-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D004",
    "doctorId": "D004",
    "name": "Dr. Rekha Singh",
    "firstName": "Rekha",
    "lastName": "Singh",
    "email": ".rekha.singh@neohms.in",
    "phone": "+91 98100 11004",
    "department": "Maternity & Gynaecology",
    "qualification": "MBBS, MS (OBG)",
    "specialization": "High-risk Obstetrics",
    "experience": 9,
    "status": "Active",
    "joiningDate": "2014-04-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D005",
    "doctorId": "D005",
    "name": "Dr. Suresh Bhat",
    "firstName": "Suresh",
    "lastName": "Bhat",
    "email": ".suresh.bhat@neohms.in",
    "phone": "+91 98100 11005",
    "department": "Orthopaedics",
    "qualification": "MBBS, MS (Ortho)",
    "specialization": "Joint Replacement",
    "experience": 10,
    "status": "Active",
    "joiningDate": "2015-05-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D006",
    "doctorId": "D006",
    "name": "Dr. Vikram Nair",
    "firstName": "Vikram",
    "lastName": "Nair",
    "email": ".vikram.nair@neohms.in",
    "phone": "+91 98100 11006",
    "department": "Paediatrics",
    "qualification": "MBBS, DCH, MD",
    "specialization": "Neonatology",
    "experience": 11,
    "status": "Active",
    "joiningDate": "2016-06-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D007",
    "doctorId": "D007",
    "name": "Dr. Leena Joseph",
    "firstName": "Leena",
    "lastName": "Joseph",
    "email": ".leena.joseph@neohms.in",
    "phone": "+91 98100 11007",
    "department": "Dermatology",
    "qualification": "MBBS, DVD",
    "specialization": "Cosmetic Dermatology",
    "experience": 12,
    "status": "On Leave",
    "joiningDate": "2017-07-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D008",
    "doctorId": "D008",
    "name": "Dr. Arun Krishnan",
    "firstName": "Arun",
    "lastName": "Krishnan",
    "email": ".arun.krishnan@neohms.in",
    "phone": "+91 98100 11008",
    "department": "ENT",
    "qualification": "MBBS, MS (ENT)",
    "specialization": "Head & Neck Surgery",
    "experience": 13,
    "status": "Active",
    "joiningDate": "2018-08-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D009",
    "doctorId": "D009",
    "name": "Dr. Pooja Gupta",
    "firstName": "Pooja",
    "lastName": "Gupta",
    "email": ".pooja.gupta@neohms.in",
    "phone": "+91 98100 11009",
    "department": "Ophthalmology",
    "qualification": "MBBS, DO",
    "specialization": "Retina & Cornea",
    "experience": 14,
    "status": "Active",
    "joiningDate": "2019-01-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D010",
    "doctorId": "D010",
    "name": "Dr. Rahul Mehta",
    "firstName": "Rahul",
    "lastName": "Mehta",
    "email": ".rahul.mehta@neohms.in",
    "phone": "+91 98100 11010",
    "department": "Emergency & Trauma",
    "qualification": "MBBS, MD (Emergency)",
    "specialization": "Emergency Medicine",
    "experience": 15,
    "status": "Active",
    "joiningDate": "2011-02-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D011",
    "doctorId": "D011",
    "name": "Dr. Sanjay Dutt",
    "firstName": "Sanjay",
    "lastName": "Dutt",
    "email": ".sanjay.dutt@neohms.in",
    "phone": "+91 98100 11011",
    "department": "Urology",
    "qualification": "MBBS, MCh (Urology)",
    "specialization": "Endourology",
    "experience": 16,
    "status": "Active",
    "joiningDate": "2012-03-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D012",
    "doctorId": "D012",
    "name": "Dr. Neha Kulkarni",
    "firstName": "Neha",
    "lastName": "Kulkarni",
    "email": ".neha.kulkarni@neohms.in",
    "phone": "+91 98100 11012",
    "department": "Psychiatry",
    "qualification": "MBBS, MD (Psychiatry)",
    "specialization": "Clinical Psychiatry",
    "experience": 17,
    "status": "Active",
    "joiningDate": "2013-04-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D013",
    "doctorId": "D013",
    "name": "Dr. Alok Verma",
    "firstName": "Alok",
    "lastName": "Verma",
    "email": ".alok.verma@neohms.in",
    "phone": "+91 98100 11013",
    "department": "Pulmonology",
    "qualification": "MBBS, DTCD",
    "specialization": "Respiratory Medicine",
    "experience": 18,
    "status": "Active",
    "joiningDate": "2014-05-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D014",
    "doctorId": "D014",
    "name": "Dr. Shalini Das",
    "firstName": "Shalini",
    "lastName": "Das",
    "email": ".shalini.das@neohms.in",
    "phone": "+91 98100 11014",
    "department": "Endocrinology",
    "qualification": "MBBS, DM (Endo)",
    "specialization": "Diabetes & Thyroid",
    "experience": 19,
    "status": "Active",
    "joiningDate": "2015-06-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D015",
    "doctorId": "D015",
    "name": "Dr. Rakesh Jhunjhun",
    "firstName": "Rakesh",
    "lastName": "Jhunjhun",
    "email": ".rakesh.jhunjhun@neohms.in",
    "phone": "+91 98100 11015",
    "department": "Gastroenterology",
    "qualification": "MBBS, DM (Gastro)",
    "specialization": "Hepatology",
    "experience": 20,
    "status": "Active",
    "joiningDate": "2016-07-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D016",
    "doctorId": "D016",
    "name": "Dr. Meera Nambiar",
    "firstName": "Meera",
    "lastName": "Nambiar",
    "email": ".meera.nambiar@neohms.in",
    "phone": "+91 98100 11016",
    "department": "Nephrology",
    "qualification": "MBBS, DM (Nephro)",
    "specialization": "Renal Transplant",
    "experience": 6,
    "status": "Active",
    "joiningDate": "2017-08-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D017",
    "doctorId": "D017",
    "name": "Dr. Siddharth Roy",
    "firstName": "Siddharth",
    "lastName": "Roy",
    "email": ".siddharth.roy@neohms.in",
    "phone": "+91 98100 11017",
    "department": "Oncology",
    "qualification": "MBBS, DM (Oncology)",
    "specialization": "Medical Oncology",
    "experience": 7,
    "status": "Active",
    "joiningDate": "2018-01-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D018",
    "doctorId": "D018",
    "name": "Dr. Farhan Akhtar",
    "firstName": "Farhan",
    "lastName": "Akhtar",
    "email": ".farhan.akhtar@neohms.in",
    "phone": "+91 98100 11018",
    "department": "Rheumatology",
    "qualification": "MBBS, DNB",
    "specialization": "Autoimmune Diseases",
    "experience": 8,
    "status": "Active",
    "joiningDate": "2019-02-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D019",
    "doctorId": "D019",
    "name": "Dr. Swati Banerjee",
    "firstName": "Swati",
    "lastName": "Banerjee",
    "email": ".swati.banerjee@neohms.in",
    "phone": "+91 98100 11019",
    "department": "Hematology",
    "qualification": "MBBS, DM (Hemato)",
    "specialization": "Bone Marrow Transplant",
    "experience": 9,
    "status": "Active",
    "joiningDate": "2011-03-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D020",
    "doctorId": "D020",
    "name": "Dr. Varun Dhawan",
    "firstName": "Varun",
    "lastName": "Dhawan",
    "email": ".varun.dhawan@neohms.in",
    "phone": "+91 98100 11020",
    "department": "Plastic Surgery",
    "qualification": "MBBS, MCh",
    "specialization": "Reconstructive Surgery",
    "experience": 10,
    "status": "Active",
    "joiningDate": "2012-04-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D021",
    "doctorId": "D021",
    "name": "Dr. Kirti Azad",
    "firstName": "Kirti",
    "lastName": "Azad",
    "email": ".kirti.azad@neohms.in",
    "phone": "+91 98100 11021",
    "department": "Vascular Surgery",
    "qualification": "MBBS, MCh",
    "specialization": "Endovascular Surgery",
    "experience": 11,
    "status": "Active",
    "joiningDate": "2013-05-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D022",
    "doctorId": "D022",
    "name": "Dr. Vandana Luthra",
    "firstName": "Vandana",
    "lastName": "Luthra",
    "email": ".vandana.luthra@neohms.in",
    "phone": "+91 98100 11022",
    "department": "Pathology",
    "qualification": "MBBS, MD (Path)",
    "specialization": "Histopathology",
    "experience": 12,
    "status": "Active",
    "joiningDate": "2014-06-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D023",
    "doctorId": "D023",
    "name": "Dr. Arvind Swamy",
    "firstName": "Arvind",
    "lastName": "Swamy",
    "email": ".arvind.swamy@neohms.in",
    "phone": "+91 98100 11023",
    "department": "Microbiology",
    "qualification": "MBBS, MD",
    "specialization": "Infectious Diseases",
    "experience": 13,
    "status": "Active",
    "joiningDate": "2015-07-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D024",
    "doctorId": "D024",
    "name": "Dr. Preeti Deshmukh",
    "firstName": "Preeti",
    "lastName": "Deshmukh",
    "email": ".preeti.deshmukh@neohms.in",
    "phone": "+91 98100 11024",
    "department": "Anesthesiology",
    "qualification": "MBBS, DA, MD",
    "specialization": "Critical Care Anesthesia",
    "experience": 14,
    "status": "Active",
    "joiningDate": "2016-08-15",
    "schedule": "Mon-Fri 09:00-17:00"
  },
  {
    "id": "D025",
    "doctorId": "D025",
    "name": "Dr. Tanmay Bhatt",
    "firstName": "Tanmay",
    "lastName": "Bhatt",
    "email": ".tanmay.bhatt@neohms.in",
    "phone": "+91 98100 11025",
    "department": "Radiology",
    "qualification": "MBBS, MD (Radiology)",
    "specialization": "Interventional Radiology",
    "experience": 15,
    "status": "Active",
    "joiningDate": "2017-01-15",
    "schedule": "Mon-Fri 09:00-17:00"
  }
];

const getLocal = () => {
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (d) { const parsed = JSON.parse(d); if (Array.isArray(parsed) && parsed.length >= 20) return parsed; }
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
