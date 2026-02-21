import { apiRequest } from './apiClient';

// Workshop API
export const workshopAPI = {
  // Get all workshops
  getAllWorkshops: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/workshops${queryString ? `?${queryString}` : ''}`);
  },

  // Get a single workshop by ID
  getWorkshopById: async (id) => {
    return apiRequest(`/api/workshops/${id}`);
  },

  // Create a new workshop
  createWorkshop: async (workshopData) => {
    return apiRequest('/api/workshops', {
      method: 'POST',
      body: JSON.stringify(workshopData),
    });
  },

  // Update a workshop
  updateWorkshop: async (id, workshopData) => {
    return apiRequest(`/api/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workshopData),
    });
  },

  // Delete a workshop
  deleteWorkshop: async (id) => {
    return apiRequest(`/api/workshops/${id}`, {
      method: 'DELETE',
    });
  },

  // Register a participant for a workshop
  registerParticipant: async (id, studentId = null) => {
    return apiRequest(`/api/workshops/${id}/register`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  // Unregister a participant from a workshop
  unregisterParticipant: async (id, studentId = null) => {
    return apiRequest(`/api/workshops/${id}/register`, {
      method: 'DELETE',
      body: JSON.stringify({ studentId }),
    });
  },
};

export default workshopAPI;























