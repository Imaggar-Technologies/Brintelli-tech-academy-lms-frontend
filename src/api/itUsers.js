import { apiRequest } from './apiClient';

// IT User Management API
export const itUserAPI = {
  // Create user
  createUser: async (userData) => {
    return apiRequest('/api/it/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get users with filtering
  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.includeInactive) queryParams.append('includeInactive', filters.includeInactive);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/it/users${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get user by ID
  getUserById: async (userId) => {
    return apiRequest(`/api/it/users/${userId}`);
  },

  // Update user
  updateUser: async (userId, updates) => {
    return apiRequest(`/api/it/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Reset password
  resetPassword: async (userId, newPassword) => {
    return apiRequest(`/api/it/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  // Assign role
  assignRole: async (userId, role) => {
    return apiRequest(`/api/it/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Enable/disable user
  enableDisableUser: async (userId, isActive) => {
    return apiRequest(`/api/it/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },
};

export default itUserAPI;

