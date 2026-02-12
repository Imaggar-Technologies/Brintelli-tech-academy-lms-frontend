import { apiRequest } from './apiClient';

const salesCallApi = {
  /**
   * Create a new sales call
   */
  createCall: async (callData) => {
    return apiRequest('/api/sales/calls', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  },

  /**
   * Get sales call by ID
   */
  getCallById: async (callId) => {
    return apiRequest(`/api/sales/calls/${callId}`);
  },

  /**
   * Get all calls for current sales executive
   */
  getMyCalls: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return apiRequest(`/api/sales/calls/my-calls?${params.toString()}`);
  },

  /**
   * Get all calls for a lead
   */
  getCallsByLead: async (leadId) => {
    return apiRequest(`/api/sales/calls/lead/${leadId}`);
  },

  /**
   * Update sales call
   */
  updateCall: async (callId, updates) => {
    return apiRequest(`/api/sales/calls/${callId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Start a sales call
   */
  startCall: async (callId) => {
    return apiRequest(`/api/sales/calls/${callId}/start`, {
      method: 'POST',
    });
  },

  /**
   * End a sales call and save insights
   */
  endCall: async (callId, insights, leadStatusUpdate) => {
    return apiRequest(`/api/sales/calls/${callId}/end`, {
      method: 'POST',
      body: JSON.stringify({
        insights,
        leadStatusUpdate,
      }),
    });
  },

  /**
   * Get call insights
   */
  getCallInsights: async (callId) => {
    return apiRequest(`/api/sales/calls/${callId}/insights`);
  },

  /**
   * Update lead status from call
   */
  updateLeadStatus: async (callId, leadStatusUpdate) => {
    return apiRequest(`/api/sales/calls/${callId}/update-lead-status`, {
      method: 'POST',
      body: JSON.stringify({ leadStatusUpdate }),
    });
  },

  /**
   * Join call via secure token
   */
  joinByToken: async (token) => {
    return apiRequest(`/api/sales/calls/join/${token}`);
  },

  /**
   * Invite members to a call
   */
  inviteMembers: async (callId, userIds) => {
    return apiRequest(`/api/sales/calls/${callId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  },

  /**
   * Resolve meeting ID to sales call ID (for /meetings/join redirect)
   */
  resolveByMeetingId: async (meetingId) => {
    return apiRequest(`/api/sales/calls/resolve-meeting/${meetingId}`);
  },

  /**
   * Accept a call invitation
   */
  acceptInvitation: async (callId) => {
    return apiRequest(`/api/sales/calls/${callId}/accept-invitation`, {
      method: 'POST',
    });
  },

  /**
   * Reject a call invitation
   */
  rejectInvitation: async (callId) => {
    return apiRequest(`/api/sales/calls/${callId}/reject-invitation`, {
      method: 'POST',
    });
  },
};

export default salesCallApi;

