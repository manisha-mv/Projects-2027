// services/patientService.js
// Patient Management API Client with persistent LocalStorage fallback

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_STORAGE_KEY = 'neo_hms_patients_v1';

// Initial realistic dataset for NEO-HMS Smart Hospital
const INITIAL_PATIENTS = [
  {
    id: 'P10025',
    patientId: 'P10025',
    firstName: 'Arun',
    lastName: 'Kumar',
    name: 'Arun Kumar',
    dateOfBirth: '1984-05-14',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    contact: {
      phone: '+91 98450 12345',
      email: 'arun.kumar@gmail.com',
      address: {
        street: '12-A, M.G. Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Sunita Kumar',
      relation: 'Wife',
      phone: '+91 98450 99887',
    },
    allergies: [
      { substance: 'Penicillin', reaction: 'Skin Rash', severity: 'Moderate' },
      { substance: 'Peanuts', reaction: 'Anaphylaxis', severity: 'Severe' },
    ],
    medicalHistory: [
      { condition: 'Essential Hypertension', since: '2021', notes: 'Controlled on Telmisartan 40mg' },
      { condition: 'Type 2 Diabetes', since: '2023', notes: 'HbA1c 6.8%' },
    ],
    lastVisit: '2026-08-14',
    status: 'Inpatient',
    registeredDate: '2025-01-10',
    notes: 'Admitted in General Ward GW-04 for blood pressure observation.',
  },
  {
    id: 'P10041',
    patientId: 'P10041',
    firstName: 'Meena',
    lastName: 'Devi',
    name: 'Meena Devi',
    dateOfBirth: '1991-11-20',
    age: 35,
    gender: 'Female',
    bloodGroup: 'B+',
    contact: {
      phone: '+91 97112 88341',
      email: 'meena.devi@outlook.com',
      address: {
        street: '45 Lake View Colony',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560037',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Ramesh Devi',
      relation: 'Husband',
      phone: '+91 97112 88390',
    },
    allergies: [
      { substance: 'Sulfa Drugs', reaction: 'Hives', severity: 'Mild' },
    ],
    medicalHistory: [
      { condition: 'Gestational Diabetes', since: '2024', notes: 'Dietary management' },
    ],
    lastVisit: '2026-08-16',
    status: 'Active',
    registeredDate: '2025-03-22',
    notes: 'Maternity OPD checkup scheduled weekly.',
  },
  {
    id: 'P10067',
    patientId: 'P10067',
    firstName: 'Rajesh',
    lastName: 'Nair',
    name: 'Rajesh Nair',
    dateOfBirth: '1968-03-08',
    age: 58,
    gender: 'Male',
    bloodGroup: 'A+',
    contact: {
      phone: '+91 94471 44520',
      email: 'rnair68@yahoo.com',
      address: {
        street: '88 Indira Nagar 2nd Stage',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Anjali Nair',
      relation: 'Daughter',
      phone: '+91 94471 99112',
    },
    allergies: [],
    medicalHistory: [
      { condition: 'Coronary Artery Disease', since: '2020', notes: 'Post Angioplasty 2021' },
      { condition: 'Hyperlipidemia', since: '2019', notes: 'Atorvastatin 20mg daily' },
    ],
    lastVisit: '2026-08-12',
    status: 'Outpatient',
    registeredDate: '2024-09-15',
    notes: 'Cardiology routine follow-up patient.',
  },
  {
    id: 'P10033',
    patientId: 'P10033',
    firstName: 'Sunita',
    lastName: 'Iyer',
    name: 'Sunita Iyer',
    dateOfBirth: '1976-08-25',
    age: 50,
    gender: 'Female',
    bloodGroup: 'AB+',
    contact: {
      phone: '+91 98200 55123',
      email: 'sunita.iyer@gmail.com',
      address: {
        street: '104 Koramangala 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Venkatesh Iyer',
      relation: 'Husband',
      phone: '+91 98200 55199',
    },
    allergies: [
      { substance: 'Aspirin', reaction: 'Bronchospasm', severity: 'Severe' },
    ],
    medicalHistory: [
      { condition: 'Acute Myocardial Infarction', since: '2026', notes: 'Stent placed Aug 13' },
    ],
    lastVisit: '2026-08-17',
    status: 'Inpatient',
    registeredDate: '2025-06-01',
    notes: 'Currently in Cardiology ICU bed CAR-02.',
  },
  {
    id: 'P10052',
    patientId: 'P10052',
    firstName: 'Mohammed',
    lastName: 'Aslam',
    name: 'Mohammed Aslam',
    dateOfBirth: '1989-12-05',
    age: 36,
    gender: 'Male',
    bloodGroup: 'B-',
    contact: {
      phone: '+91 91672 33410',
      email: 'm.aslam@gmail.com',
      address: {
        street: '18 Frazer Town',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560005',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Aisha Aslam',
      relation: 'Sister',
      phone: '+91 91672 33499',
    },
    allergies: [],
    medicalHistory: [
      { condition: 'Bronchial Asthma', since: '2015', notes: 'Inhaler as needed' },
    ],
    lastVisit: '2026-08-18',
    status: 'Active',
    registeredDate: '2025-11-18',
    notes: 'General Medicine consultation completed today.',
  },
  {
    id: 'P10047',
    patientId: 'P10047',
    firstName: 'Prakash',
    lastName: 'Nair',
    name: 'Prakash Nair',
    dateOfBirth: '1972-04-18',
    age: 54,
    gender: 'Male',
    bloodGroup: 'O-',
    contact: {
      phone: '+91 98860 77123',
      email: 'pnair@gmail.com',
      address: {
        street: '72 Jayanagar 9th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560069',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Deepa Nair',
      relation: 'Wife',
      phone: '+91 98860 77999',
    },
    allergies: [
      { substance: 'Iodine Contrast', reaction: 'Nausea & Rash', severity: 'Moderate' },
    ],
    medicalHistory: [
      { condition: 'Chronic Migraine', since: '2018', notes: 'Acute flare-up under evaluation' },
    ],
    lastVisit: '2026-08-15',
    status: 'Inpatient',
    registeredDate: '2025-04-12',
    notes: 'Admitted in Neurology Ward NEU-07.',
  },
  {
    id: 'P10011',
    patientId: 'P10011',
    firstName: 'Kavitha',
    lastName: 'Rao',
    name: 'Kavitha Rao',
    dateOfBirth: '1982-01-30',
    age: 44,
    gender: 'Female',
    bloodGroup: 'A-',
    contact: {
      phone: '+91 99001 22884',
      email: 'kavitha.rao@techindia.com',
      address: {
        street: '55 Whitefield Main Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Suresh Rao',
      relation: 'Brother',
      phone: '+91 99001 22800',
    },
    allergies: [],
    medicalHistory: [
      { condition: 'Hypothyroidism', since: '2022', notes: 'Levothyroxine 50mcg' },
    ],
    lastVisit: '2026-08-10',
    status: 'Discharged',
    registeredDate: '2024-10-05',
    notes: 'Discharged following recovery from viral fever.',
  },
  {
    id: 'P10069',
    patientId: 'P10069',
    firstName: 'Deepa',
    lastName: 'Thomas',
    name: 'Deepa Thomas',
    dateOfBirth: '1995-07-12',
    age: 31,
    gender: 'Female',
    bloodGroup: 'AB-',
    contact: {
      phone: '+91 97400 11223',
      email: 'deepa.thomas@gmail.com',
      address: {
        street: '22 HSR Layout Sector 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560102',
        country: 'India',
      },
    },
    emergencyContact: {
      name: 'Mathew Thomas',
      relation: 'Father',
      phone: '+91 97400 11999',
    },
    allergies: [
      { substance: 'NSAIDs', reaction: 'Gastric Distress', severity: 'Moderate' },
    ],
    medicalHistory: [
      { condition: 'Acute Appendicitis', since: '2026', notes: 'Emergency evaluation' },
    ],
    lastVisit: '2026-08-18',
    status: 'Inpatient',
    registeredDate: '2026-08-18',
    notes: 'Admitted via Emergency Department to ICU Bed E-07.',
  },
];

// Helper to calculate age from DOB
export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

// Initialize LocalStorage store if needed
const getLocalPatients = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to parse local patient store', err);
  }
  // Set initial store
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
  return INITIAL_PATIENTS;
};

const saveLocalPatients = (patients) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Failed to save patients to LocalStorage', err);
  }
};

// Auto-generate next Patient ID
export const generateNextPatientId = () => {
  const patients = getLocalPatients();
  let maxSeq = 10075;
  patients.forEach(p => {
    const match = p.patientId?.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  return `P${maxSeq + 1}`;
};

/**
 * Service API Methods
 */
export const patientService = {
  // GET Patients list with search, filter, and pagination
  async getPatients(params = {}) {
    const {
      search = '',
      gender = '',
      bloodGroup = '',
      status = '',
      page = 1,
      limit = 10,
    } = params;

    // Attempt real backend API if available
    try {
      const queryParts = [];
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
      if (gender) queryParts.push(`gender=${encodeURIComponent(gender)}`);
      if (bloodGroup) queryParts.push(`bloodGroup=${encodeURIComponent(bloodGroup)}`);
      if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
      queryParts.push(`page=${page}`);
      queryParts.push(`limit=${limit}`);

      const queryString = queryParts.join('&');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/patients?${queryString}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          return {
            patients: resData.data,
            total: resData.pagination?.total || resData.data.length,
            page: resData.pagination?.page || page,
            pages: resData.pagination?.pages || Math.ceil((resData.pagination?.total || resData.data.length) / limit),
            isLiveApi: true,
          };
        }
      }
    } catch {
      // Backend unavailable; fallback seamlessly to LocalStorage
    }

    // Local / Offline dataset fallback logic
    let list = getLocalPatients();

    // 1. Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => (
        (p.patientId && p.patientId.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.firstName && p.firstName.toLowerCase().includes(q)) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.contact?.phone && p.contact.phone.toLowerCase().includes(q))
      ));
    }

    // 2. Gender filter
    if (gender && gender !== 'All') {
      list = list.filter(p => p.gender?.toLowerCase() === gender.toLowerCase());
    }

    // 3. Blood group filter
    if (bloodGroup && bloodGroup !== 'All') {
      list = list.filter(p => p.bloodGroup === bloodGroup);
    }

    // 4. Status filter
    if (status && status !== 'All') {
      list = list.filter(p => p.status?.toLowerCase() === status.toLowerCase());
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedPatients = list.slice(startIndex, startIndex + limit);

    return {
      patients: paginatedPatients,
      total,
      page: safePage,
      pages: totalPages,
      isLiveApi: false,
    };
  },

  // GET Single Patient by ID
  async getPatientById(id) {
    if (!id) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          return { patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Fallback
    }

    const list = getLocalPatients();
    const patient = list.find(p => p.id === id || p.patientId === id);
    if (!patient) return null;

    return { patient, isLiveApi: false };
  },

  // POST Create New Patient
  async createPatient(patientData) {
    const newId = generateNextPatientId();
    const fullName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || patientData.name;
    const computedAge = calculateAge(patientData.dateOfBirth) ?? patientData.age ?? 0;

    const newPatientRecord = {
      id: newId,
      patientId: newId,
      firstName: patientData.firstName || fullName.split(' ')[0] || 'Patient',
      lastName: patientData.lastName || fullName.split(' ').slice(1).join(' ') || '',
      name: fullName,
      dateOfBirth: patientData.dateOfBirth,
      age: computedAge,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup || 'Unknown',
      contact: {
        phone: patientData.phone || patientData.contact?.phone || '',
        email: patientData.email || patientData.contact?.email || null,
        address: {
          street: patientData.addressStreet || patientData.contact?.address?.street || null,
          city: patientData.addressCity || patientData.contact?.address?.city || 'Bengaluru',
          state: patientData.addressState || patientData.contact?.address?.state || 'Karnataka',
          postalCode: patientData.addressPostalCode || patientData.contact?.address?.postalCode || null,
          country: 'India',
        },
      },
      emergencyContact: {
        name: patientData.emergencyName || patientData.emergencyContact?.name || null,
        relation: patientData.emergencyRelation || patientData.emergencyContact?.relation || null,
        phone: patientData.emergencyPhone || patientData.emergencyContact?.phone || null,
      },
      allergies: Array.isArray(patientData.allergies)
        ? patientData.allergies
        : (patientData.allergiesString ? patientData.allergiesString.split(',').map(s => ({ substance: s.trim(), severity: 'Moderate' })) : []),
      medicalHistory: Array.isArray(patientData.medicalHistory)
        ? patientData.medicalHistory
        : (patientData.medicalHistoryNotes ? [{ condition: patientData.medicalHistoryNotes, since: new Date().getFullYear().toString() }] : []),
      lastVisit: new Date().toISOString().split('T')[0],
      status: patientData.status || 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      notes: patientData.notes || '',
    };

    // Attempt real backend POST
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: newPatientRecord.firstName,
          lastName: newPatientRecord.lastName,
          dateOfBirth: newPatientRecord.dateOfBirth,
          gender: newPatientRecord.gender,
          bloodGroup: newPatientRecord.bloodGroup,
          contact: newPatientRecord.contact,
          emergencyContact: newPatientRecord.emergencyContact,
          allergies: newPatientRecord.allergies,
          medicalHistory: newPatientRecord.medicalHistory,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          // Sync with local list
          const list = getLocalPatients();
          list.unshift(resData.data);
          saveLocalPatients(list);
          return { success: true, patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Backend offline fallback
    }

    // Save locally
    const list = getLocalPatients();
    list.unshift(newPatientRecord);
    saveLocalPatients(list);

    return { success: true, patient: newPatientRecord, isLiveApi: false };
  },

  // PUT Update Patient
  async updatePatient(id, patientData) {
    const list = getLocalPatients();
    const index = list.findIndex(p => p.id === id || p.patientId === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }

    const current = list[index];
    const fullName = `${patientData.firstName ?? current.firstName} ${patientData.lastName ?? current.lastName}`.trim();
    const updatedAge = patientData.dateOfBirth ? calculateAge(patientData.dateOfBirth) : current.age;

    const updatedRecord = {
      ...current,
      firstName: patientData.firstName ?? current.firstName,
      lastName: patientData.lastName ?? current.lastName,
      name: fullName,
      dateOfBirth: patientData.dateOfBirth ?? current.dateOfBirth,
      age: updatedAge,
      gender: patientData.gender ?? current.gender,
      bloodGroup: patientData.bloodGroup ?? current.bloodGroup,
      status: patientData.status ?? current.status,
      contact: {
        ...current.contact,
        phone: patientData.phone ?? current.contact?.phone,
        email: patientData.email ?? current.contact?.email,
        address: {
          ...current.contact?.address,
          street: patientData.addressStreet ?? current.contact?.address?.street,
          city: patientData.addressCity ?? current.contact?.address?.city,
          state: patientData.addressState ?? current.contact?.address?.state,
          postalCode: patientData.addressPostalCode ?? current.contact?.address?.postalCode,
        },
      },
      emergencyContact: {
        ...current.emergencyContact,
        name: patientData.emergencyName ?? current.emergencyContact?.name,
        relation: patientData.emergencyRelation ?? current.emergencyContact?.relation,
        phone: patientData.emergencyPhone ?? current.emergencyContact?.phone,
      },
      notes: patientData.notes ?? current.notes,
    };

    // Attempt real backend PUT
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedRecord),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          list[index] = resData.data;
          saveLocalPatients(list);
          return { success: true, patient: resData.data, isLiveApi: true };
        }
      }
    } catch {
      // Backend offline fallback
    }

    list[index] = updatedRecord;
    saveLocalPatients(list);

    return { success: true, patient: updatedRecord, isLiveApi: false };
  },
};

export default patientService;
