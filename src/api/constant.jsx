// API Base URL - Centralized configuration
// Recommended: set VITE_API_BASE_URL in an env file (e.g. `.env.local`) to avoid surprises.
// In local dev (Vite), default to localhost; in prod builds, default to the deployed API.
// Local backend default (Express)
const DEFAULT_DEV_API_BASE_URL = 'https://app.brintellitechacademy.in';
const DEFAULT_PROD_API_BASE_URL = 'https://app.brintellitechacademy.in';

const envBaseUrl = (import.meta?.env?.VITE_API_BASE_URL || '').trim();

// Detect development mode: check Vite env vars
const isViteDev = import.meta?.env?.DEV === true || import.meta?.env?.MODE === 'development';

// Safely detect if running on localhost (only when window is available)
const getIsLocalhost = () => {
  try {
    if (typeof globalThis === 'undefined' || !globalThis.window?.location) {
      return false;
    }
    const hostname = globalThis.window.location.hostname;
    return (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    );
  } catch (e) {
    // If we can't access window, assume not localhost
    return false;
  }
};

const isLocalhost = getIsLocalhost();
const isDevelopment = isViteDev || isLocalhost;

// Use dev URL in development mode, prod URL in production
const fallbackBaseUrl = isDevelopment ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL;

// If running on localhost, always use localhost API (even if env var is set to production)
// This prevents CORS issues when developing locally
let finalApiBaseUrl;
if (isLocalhost && !envBaseUrl) {
  // No env var set, use localhost
  finalApiBaseUrl = DEFAULT_DEV_API_BASE_URL;
} else if (isLocalhost && envBaseUrl && envBaseUrl.includes('localhost')) {
  // Env var is set to localhost, use it
  finalApiBaseUrl = envBaseUrl;
} else if (isLocalhost && envBaseUrl && !envBaseUrl.includes('localhost')) {
  // Env var is set to production but we're on localhost - use localhost to avoid CORS
  if (isDevelopment) {
    console.warn('⚠️ Running on localhost but VITE_API_BASE_URL points to production. Using localhost to avoid CORS issues.');
  }
  finalApiBaseUrl = DEFAULT_DEV_API_BASE_URL;
} else {
  // Not on localhost, use env var or fallback
  finalApiBaseUrl = envBaseUrl || fallbackBaseUrl;
}

export const API_BASE_URL = finalApiBaseUrl;

// Debug logging (only in development)
if (isDevelopment && typeof console !== 'undefined') {
  console.log('🔧 API Configuration:', {
    envBaseUrl: envBaseUrl || '(not set)',
    isViteDev,
    isLocalhost,
    isDevelopment,
    fallbackBaseUrl,
    finalUrl: API_BASE_URL
  });
}

 

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
  const url = globalThis.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  globalThis.URL.revokeObjectURL(url);
  a.remove();
  
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
  // Interviews
  INTERVIEWS: {
    GET_ALL: '/api/interviews',
    GET_ONE: (interviewId) => `/api/interviews/${interviewId}`,
    CREATE: '/api/interviews',
    UPDATE: (interviewId) => `/api/interviews/${interviewId}`,
    DELETE: (interviewId) => `/api/interviews/${interviewId}`,
    GET_ROUNDS: (interviewId) => `/api/interviews/${interviewId}/rounds`,
    UPDATE_ROUND: (interviewId, roundId) => `/api/interviews/${interviewId}/rounds/${roundId}`,
  },
};

