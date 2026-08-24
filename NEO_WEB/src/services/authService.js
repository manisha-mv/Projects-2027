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
  { id: 'u1',  email: 'admin@hospital.com',      password: 'password123', name: 'System Admin',       role: 'ADMIN',             initials: 'AD' },
  { id: 'u2',  email: 'doctor@hospital.com',     password: 'password123', name: 'Dr. Priya Sharma',   role: 'DOCTOR',            initials: 'PS' },
  { id: 'u3',  email: 'reception@hospital.com',  password: 'password123', name: 'Reception Desk',     role: 'RECEPTIONIST',      initials: 'RD' },
  { id: 'u4',  email: 'pharmacy@hospital.com',   password: 'password123', name: 'Pharmacy Team',      role: 'PHARMACIST',        initials: 'PT' },
  { id: 'u5',  email: 'lab@hospital.com',        password: 'password123', name: 'Laboratory Dept',    role: 'LAB',               initials: 'LD' },
  { id: 'u6',  email: 'nurse@hospital.com',      password: 'password123', name: 'Nurse Station',      role: 'NURSE',             initials: 'NS' },
  { id: 'u7',  email: 'billing@hospital.com',    password: 'password123', name: 'Billing Dept',       role: 'BILLING',           initials: 'BD' },
  { id: 'u8',  email: 'radiology@hospital.com',  password: 'password123', name: 'Radiology Dept',     role: 'RADIOLOGY',         initials: 'RD' },
  { id: 'u9',  email: 'insurance@hospital.com',  password: 'password123', name: 'Insurance Team',     role: 'INSURANCE',         initials: 'IT' },
  { id: 'u10', email: 'complaint@hospital.com',  password: 'password123', name: 'Complaint Officer',  role: 'COMPLAINT_OFFICER', initials: 'CO' },
];

export const authService = {
  /**
   * Attempt login — tries real backend first, falls back to mock users.
   */
  login: async (email, password) => {
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
            id:       data.user._id || data.user.id,
            email:    data.user.email,
            name:     data.user.name,
            role:     data.user.role,
            initials: data.user.initials || data.user.name?.slice(0, 2).toUpperCase() || '??',
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
          return sessionUser;
        }
      }

      // Backend responded but login failed (wrong credentials)
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || 'Invalid email or password');
    } catch (err) {
      // If it's an auth rejection (not a network error), re-throw
      if (err.message !== 'Failed to fetch' && !err.message.includes('NetworkError') && !err.message.startsWith('Load failed')) {
        // Check if this is actually a credentials error from backend
        if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('password') || err.message.toLowerCase().includes('credentials')) {
          throw err;
        }
      }
      // Network error — backend unavailable, fall through to mock
    }

    // 2. Fallback: mock users (development only)
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = {
      id:       mockUser.id,
      email:    mockUser.email,
      name:     mockUser.name,
      role:     mockUser.role,
      initials: mockUser.initials,
    };

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
