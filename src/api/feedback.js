import { API_ENDPOINTS } from './constant';
import { apiRequest } from './apiClient';

// Feedback API
export const feedbackAPI = {
  // Get all feedbacks
  getAllFeedbacks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.search) params.append('search', filters.search);
    if (filters.tutorId) params.append('tutorId', filters.tutorId);
    if (filters.sessionId) params.append('sessionId', filters.sessionId);
    
    const queryString = params.toString();
    return apiRequest(`${API_ENDPOINTS.FEEDBACKS.GET_ALL}${queryString ? `?${queryString}` : ''}`);
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId) => {
    return apiRequest(API_ENDPOINTS.FEEDBACKS.GET_ONE(feedbackId));
  },

  // Create feedback
  createFeedback: async (feedbackData) => {
    return apiRequest(API_ENDPOINTS.FEEDBACKS.CREATE, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Update feedback
  updateFeedback: async (feedbackId, updates) => {
    return apiRequest(API_ENDPOINTS.FEEDBACKS.UPDATE(feedbackId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    return apiRequest(API_ENDPOINTS.FEEDBACKS.DELETE(feedbackId), {
      method: 'DELETE',
    });
  },
};

export default feedbackAPI;

