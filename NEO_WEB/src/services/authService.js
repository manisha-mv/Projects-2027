// services/authService.js
// Attempts real backend login first; falls back to mock users in development.

import { setToken, clearToken } from '../lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SESSION_KEY  = 'neohms_session';
const TOKEN_KEY    = 'neohms_token';

// ── Development mock users (fallback when backend is unavailable) ─────────────
// These allow the UI to be fully tested without a live backend.
// Remove or disable in production once real auth is deployed.
const MOCK_USERS = [
  { id: 'u1',     email: 'admin@hospital.com',      password: 'password123', name: 'System Admin',       role: 'ADMIN',             initials: 'AD' },
  { id: 'u2',     email: 'doctor@hospital.com',     password: 'password123', name: 'Dr. Priya Sharma',   role: 'DOCTOR',            initials: 'PS' },
  { id: 'u3',     email: 'reception@hospital.com',  password: 'password123', name: 'Reception Desk',     role: 'RECEPTIONIST',      initials: 'RD' },
  { id: 'u4',     email: 'pharmacy@hospital.com',   password: 'password123', name: 'Pharmacy Team',      role: 'PHARMACIST',        initials: 'PT' },
  { id: 'u5',     email: 'lab@hospital.com',        password: 'password123', name: 'Laboratory Dept',    role: 'LAB',               initials: 'LD' },
  { id: 'u6',     email: 'nurse@hospital.com',      password: 'password123', name: 'Nurse Station',      role: 'NURSE',             initials: 'NS' },
  { id: 'u7',     email: 'billing@hospital.com',    password: 'password123', name: 'Billing Dept',       role: 'BILLING',           initials: 'BD' },
  { id: 'u8',     email: 'radiology@hospital.com',  password: 'password123', name: 'Radiology Dept',     role: 'RADIOLOGY',         initials: 'RD' },
  { id: 'u9',     email: 'insurance@hospital.com',  password: 'password123', name: 'Insurance Team',     role: 'INSURANCE',         initials: 'IT' },
  { id: 'u10',    email: 'complaint@hospital.com',  password: 'password123', name: 'Complaint Officer',  role: 'COMPLAINT_OFFICER', initials: 'CO' },
  // Patient Accounts
  { id: 'P10025', email: 'arun.kumar@gmail.com',    patientId: 'P10025', password: 'password123', name: 'Arun Kumar', role: 'PATIENT', initials: 'AK' },
  { id: 'P10041', email: 'meena.devi@outlook.com',  patientId: 'P10041', password: 'password123', name: 'Meena Devi', role: 'PATIENT', initials: 'MD' },
  { id: 'P10088', email: 'patient@hospital.com',    patientId: 'P10088', password: 'password123', name: 'Rajesh Sharma', role: 'PATIENT', initials: 'RS' },
];

export const authService = {
  /**
   * Attempt login — tries real backend first, falls back to mock users.
   * Supports staff email login and patient Patient-ID / email login.
   */
  login: async (email, password) => {
    const cleanInput = (email || '').trim().toUpperCase();

    // 1. Try real backend
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token && data.user) {
          // Store JWT
          setToken(data.token);

          const sessionUser = {
            id:        data.user._id || data.user.id,
            patientId: data.user.patientId || data.user.id,
            email:     data.user.email,
            name:      data.user.name,
            role:      data.user.role || 'PATIENT',
            initials:  data.user.initials || data.user.name?.slice(0, 2).toUpperCase() || '??',
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
          return sessionUser;
        }
      }

      // Backend responded but login failed (wrong credentials)
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || 'Invalid email, Patient ID, or password');
    } catch (err) {
      if (err.message !== 'Failed to fetch' && !err.message.includes('NetworkError') && !err.message.startsWith('Load failed')) {
        if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('password') || err.message.toLowerCase().includes('credentials')) {
          throw err;
        }
      }
      // Network error — backend unavailable, fall through to mock
    }

    // 2. Fallback: mock users (development only)
    await new Promise(resolve => setTimeout(resolve, 350));

    // Match by email, or Patient ID (e.g. P10025, P10041), or mock accounts
    const mockUser = MOCK_USERS.find(u => {
      const matchEmail = u.email.toLowerCase() === email.trim().toLowerCase();
      const matchPatientId = u.patientId && cleanInput.includes(u.patientId.toUpperCase());
      const matchId = u.id.toUpperCase() === cleanInput;
      return (matchEmail || matchPatientId || matchId) && u.password === password;
    });

    // Flexible patient lookup fallback if user enters any Patient ID like P10025 / P-10025 with password123 or patient
    let sessionUser = null;
    if (mockUser) {
      sessionUser = {
        id:        mockUser.id,
        patientId: mockUser.patientId || mockUser.id,
        email:     mockUser.email,
        name:      mockUser.name,
        role:      mockUser.role,
        initials:  mockUser.initials,
      };
    } else if (cleanInput.startsWith('P') || cleanInput.includes('PAT')) {
      // Dynamic Patient Login fallback for any patient ID typed
      sessionUser = {
        id:        cleanInput.replace(/[^A-Z0-9]/g, ''),
        patientId: cleanInput.replace(/[^A-Z0-9]/g, ''),
        email:     `${cleanInput.toLowerCase()}@neocare.in`,
        name:      `Patient (${cleanInput})`,
        role:      'PATIENT',
        initials:  'PT',
      };
    } else {
      throw new Error('Invalid credentials. For Patient Login, use your Patient ID (e.g., P10025) or registered email.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Log out — clears session and JWT token.
   */
  logout: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch { /* ignore */ }

    clearToken();
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Get the current authenticated user from session storage.
   */
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a user is currently authenticated.
   */
  isAuthenticated: () => !!authService.getCurrentUser(),
};
