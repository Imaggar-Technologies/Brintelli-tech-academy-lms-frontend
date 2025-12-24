import { apiRequest } from './apiClient';

// Scholarship API
export const scholarshipAPI = {
  // Request scholarship (candidate action)
  requestScholarship: async (requestData) => {
    return apiRequest('/api/scholarships/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Get all scholarship requests (Finance dashboard)
  getAllScholarships: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.offerId) params.append('offerId', filters.offerId);
    if (filters.leadId) params.append('leadId', filters.leadId);
    
    const queryString = params.toString();
    return apiRequest(`/api/scholarships${queryString ? `?${queryString}` : ''}`);
  },

  // Get scholarship request by ID
  getScholarshipById: async (requestId) => {
    return apiRequest(`/api/scholarships/${requestId}`);
  },

  // Get scholarships by lead
  getScholarshipsByLead: async (leadId) => {
    return apiRequest(`/api/scholarships/lead/${leadId}`);
  },

  // Finance decision on scholarship
  makeScholarshipDecision: async (requestId, decisionData) => {
    return apiRequest(`/api/scholarships/${requestId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    });
  },
};

export default scholarshipAPI;

