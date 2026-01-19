import { API_ENDPOINTS } from './constant';
import { apiRequest } from './apiClient';

// Interview API
export const interviewAPI = {
  getAllInterviews: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.candidateId) params.append('candidateId', filters.candidateId);
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.scheduledDate) params.append('scheduledDate', filters.scheduledDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    const queryString = params.toString();
    return apiRequest(`${API_ENDPOINTS.INTERVIEWS.GET_ALL}${queryString ? `?${queryString}` : ''}`);
  },

  getInterviewById: async (interviewId) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.GET_ONE(interviewId));
  },

  createInterview: async (interviewData) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.CREATE, {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  updateInterview: async (interviewId, updates) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.UPDATE(interviewId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteInterview: async (interviewId) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.DELETE(interviewId), {
      method: 'DELETE',
    });
  },

  getRounds: async (interviewId) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.GET_ROUNDS(interviewId));
  },

  updateRound: async (interviewId, roundId, updates) => {
    return apiRequest(API_ENDPOINTS.INTERVIEWS.UPDATE_ROUND(interviewId, roundId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

export default interviewAPI;

