// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

