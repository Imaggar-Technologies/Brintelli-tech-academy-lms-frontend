import api from './api';

/**
 * Meeting Service
 * Handles all meeting-related API calls
 */
export const meetingAPI = {
  /**
   * Create a new meeting
   */
  createMeeting: async (meetingData) => {
    const response = await api.post('/meetings', meetingData);
    return response.data;
  },

  /**
   * Get all meetings for current user
   */
  getMeetings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/meetings?${params.toString()}`);
    return response.data;
  },

  /**
   * Get meeting by ID
   */
  getMeetingById: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
  },

  /**
   * Update meeting
   */
  updateMeeting: async (meetingId, updateData) => {
    const response = await api.put(`/meetings/${meetingId}`, updateData);
    return response.data;
  },

  /**
   * Delete meeting
   */
  deleteMeeting: async (meetingId) => {
    const response = await api.delete(`/meetings/${meetingId}`);
    return response.data;
  },

  /**
   * Join meeting
   */
  joinMeeting: async (meetingId, joinData = {}) => {
    const response = await api.post(`/meetings/${meetingId}/join`, joinData);
    return response.data;
  },

  /**
   * Get meeting participants
   */
  getParticipants: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}/participants`);
    return response.data;
  },
};

export default meetingAPI;

