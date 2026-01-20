import { apiRequest } from './apiClient';

// Mentor API
export const mentorAPI = {
  // Get mentor's assigned mentees
  getMentees: async () => {
    return apiRequest('/api/mentors/mentees');
  },

  // Get pending meeting requests
  getPendingMeetings: async () => {
    return apiRequest('/api/mentors/meetings/pending');
  },

  // Get all meetings (with optional status filter)
  getAllMeetings: async (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    return apiRequest(`/api/mentors/meetings${queryString ? `?${queryString}` : ''}`);
  },

  // Schedule a meeting (accept and set date/time)
  scheduleMeeting: async (meetingId, meetingData) => {
    return apiRequest(`/api/mentors/meetings/${meetingId}/schedule`, {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  // Complete a meeting
  completeMeeting: async (meetingId, meetingData) => {
    return apiRequest(`/api/mentors/meetings/${meetingId}/complete`, {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  // Cancel a meeting
  cancelMeeting: async (meetingId) => {
    return apiRequest(`/api/mentors/meetings/${meetingId}/cancel`, {
      method: 'POST',
    });
  },

  // Submit report for a completed meeting
  submitMeetingReport: async (meetingId, reportData) => {
    return apiRequest(`/api/mentors/meetings/${meetingId}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  // Get mentor's mentees progress
  getMenteesProgress: async () => {
    return apiRequest('/api/mentors/mentees/progress');
  },

  // Get mentor's mentees engagement
  getMenteesEngagement: async () => {
    return apiRequest('/api/mentors/mentees/engagement');
  },
};

export default mentorAPI;

