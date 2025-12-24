import { API_BASE_URL, API_ENDPOINTS } from './constant';
import { apiRequest as apiClientRequest } from './apiClient';

// For auth endpoints, we don't need token refresh logic
const authApiRequest = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };d

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API (doesn't use token refresh since these are auth endpoints)
export const authAPI = {
  login: async (email, password) => {
    return authApiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return authApiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refresh: async (refreshToken) => {
    return authApiRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout: async (refreshToken) => {
    return authApiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  forgotPassword: async (email) => {
    return authApiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// User API
export const userAPI = {
  getUser: async (userId) => {
    return apiRequest(API_ENDPOINTS.USERS.GET_USER(userId));
  },

  updateProfile: async (userId, profileData) => {
    return apiRequest(API_ENDPOINTS.USERS.UPDATE_PROFILE(userId), {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getUsersByRole: async (role) => {
    return apiRequest(API_ENDPOINTS.USERS.GET_BY_ROLE(role));
  },
};

// LMS API
export const lmsAPI = {
  getPrograms: async () => {
    return apiRequest(API_ENDPOINTS.LMS.PROGRAMS);
  },

  createProgram: async (programData) => {
    return apiRequest(API_ENDPOINTS.LMS.PROGRAMS, {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  },

  getBatches: async () => {
    return apiRequest(API_ENDPOINTS.LMS.BATCHES);
  },

  createBatch: async (batchData) => {
    return apiRequest(API_ENDPOINTS.LMS.BATCHES, {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },

  enrollStudent: async (batchId, studentId) => {
    return apiRequest(API_ENDPOINTS.LMS.ENROLL(batchId), {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (userId, options = {}) => {
    const params = new URLSearchParams(options);
    return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS.GET(userId)}?${params}`);
  },

  markAsRead: async (notificationId) => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId), {
      method: 'PUT',
    });
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  lms: lmsAPI,
  notification: notificationAPI,
};

