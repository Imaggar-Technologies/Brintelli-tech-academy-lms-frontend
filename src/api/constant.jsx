// API Base URL - Centralized configuration
// Recommended: set VITE_API_BASE_URL in an env file (e.g. `.env.local`) to avoid surprises.
// In local dev (Vite), default to localhost; in prod builds, default to the deployed API.
// Backend dev server defaults to 3001 (see backend `server.js`)
const DEFAULT_DEV_API_BASE_URL = 'http://localhost:3002';
const DEFAULT_PROD_API_BASE_URL = 'http://16.112.146.20:3000';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL);

// Helper function to get full API URL for endpoints
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Helper function for blob downloads (PDFs, Excel, etc.)
export const downloadBlob = async (endpoint, filename, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(endpoint), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return { success: true };
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
  },
  // Users
  USERS: {
    GET_ME: '/api/users/me',
    GET_USER: (userId) => `/api/users/${userId}`,
    UPDATE_PROFILE: (userId) => `/api/users/${userId}/profile`,
    GET_BY_ROLE: (role) => `/api/users/role/${role}`,
    GET_SALES_TEAM: '/api/users/sales-team',
  },
  // LMS
  LMS: {
    PROGRAMS: '/api/lms/programs',
    BATCHES: '/api/lms/batches',
    ENROLL: (batchId) => `/api/lms/batches/${batchId}/enroll`,
  },
  // Notifications
  NOTIFICATIONS: {
    GET: (userId) => `/api/notifications/${userId}`,
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
  },
  // Leads
  LEADS: {
    GET_ALL: '/api/leads',
    GET_ONE: (leadId) => `/api/leads/${leadId}`,
    CREATE: '/api/leads',
    UPDATE: (leadId) => `/api/leads/${leadId}`,
    DELETE: (leadId) => `/api/leads/${leadId}`,
    ASSIGN: (leadId) => `/api/leads/${leadId}/assign`,
    PRE_SCREENING: (leadId) => `/api/leads/${leadId}/pre-screening`,
  },
};

