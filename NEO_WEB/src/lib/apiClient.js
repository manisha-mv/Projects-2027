// src/lib/apiClient.js
// Central API client — all service files import from here.
// Uses VITE_API_BASE_URL environment variable for the base URL.
// Attaches Authorization header if a JWT token exists in localStorage.
// On 401, clears the session and redirects to /login.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SESSION_KEY = 'neohms_session';
const TOKEN_KEY   = 'neohms_token';

/**
 * Returns the stored JWT token (if any).
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

/**
 * Persists a JWT token after successful login.
 */
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Removes the JWT token (on logout).
 */
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Core fetch wrapper.
 *
 * @param {string}  path    - API path, e.g. '/patients' or '/auth/login'
 * @param {object}  options - fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws  Will throw if the request fails or returns a non-2xx status.
 */
export const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 — token expired / unauthorized
  if (response.status === 401) {
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    // Soft redirect to login without hard-refreshing the SPA
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status} ${response.statusText}`);
  }

  return data;
};

/**
 * Convenience wrappers for common HTTP methods.
 */
export const api = {
  get:    (path, opts = {}) => apiRequest(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts = {}) => apiRequest(path, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  put:    (path, body, opts = {}) => apiRequest(path, { ...opts, method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body, opts = {}) => apiRequest(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, opts = {}) => apiRequest(path, { ...opts, method: 'DELETE' }),
};

export { API_BASE_URL };
export default api;
