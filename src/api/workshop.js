import { API_BASE_URL } from './constant';
import { apiRequest, apiRequestBlob } from './apiClient';

// Public upcoming workshops (no auth) - for landing/marketing pages
export const getPublicUpcomingWorkshops = async (limit = 50) => {
  const res = await fetch(`${API_BASE_URL}/api/public/workshops?limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load workshops');
  return data;
};

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

  // Get workshop participants (enrolled users with details)
  getParticipants: async (id) => {
    return apiRequest(`/api/workshops/${id}/participants`);
  },

  // Send email to all enrolled participants
  sendEmailToEnrolled: async (id, { subject, body, type = 'custom' }) => {
    return apiRequest(`/api/workshops/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ subject, body, type }),
    });
  },

  // Assignments
  getAssignments: (id) => apiRequest(`/api/workshops/${id}/assignments`),
  createAssignment: (id, data) => apiRequest(`/api/workshops/${id}/assignments`, { method: 'POST', body: JSON.stringify(data) }),
  getSubmissions: (id, assignmentId) => apiRequest(`/api/workshops/${id}/assignments/${assignmentId}/submissions`),
  submitAssignment: (id, assignmentId, data) => apiRequest(`/api/workshops/${id}/assignments/${assignmentId}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Feedback
  getMyFeedback: (id) => apiRequest(`/api/workshops/${id}/feedback/me`),
  getFeedback: (id) => apiRequest(`/api/workshops/${id}/feedback`),
  submitFeedback: (id, data) => apiRequest(`/api/workshops/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  publishFeedbackPoll: (id, published) => apiRequest(`/api/workshops/${id}/feedback/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),

  // Tutor notes/announcements (notes, links, send email e.g. "please review")
  getWorkshopNotes: (id) => apiRequest(`/api/workshops/${id}/notes`),
  postWorkshopNote: (id, data) => apiRequest(`/api/workshops/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),

  // Quiz
  getQuiz: (id) => apiRequest(`/api/workshops/${id}/quiz`),
  createOrUpdateQuiz: (id, data) => apiRequest(`/api/workshops/${id}/quiz`, { method: 'POST', body: JSON.stringify(data) }),
  publishQuiz: (id, published) => apiRequest(`/api/workshops/${id}/quiz/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),
  submitQuizAttempt: (id, data) => apiRequest(`/api/workshops/${id}/quiz/attempt`, { method: 'POST', body: JSON.stringify(data) }),
  getLeaderboard: (id) => apiRequest(`/api/workshops/${id}/quiz/leaderboard`),

  // Resources
  updateResources: (id, data) => apiRequest(`/api/workshops/${id}/resources`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Certificates
  generateCertificates: (id, participantIds = null) =>
    apiRequest(`/api/workshops/${id}/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify(participantIds != null ? { participantIds } : {}),
    }),
  getCertificates: (id) => apiRequest(`/api/workshops/${id}/certificates`),
  downloadCertificate: (id, certId) => apiRequestBlob(`/api/workshops/${id}/certificates/${certId}/download`),
  sendCertificatesToParticipants: (id, participantIds = null) =>
    apiRequest(`/api/workshops/${id}/certificates/send`, {
      method: 'POST',
      body: JSON.stringify(participantIds != null ? { participantIds } : {}),
    }),

  // Vouchers
  getVouchers: (id) => apiRequest(`/api/workshops/${id}/vouchers`),
  getMyVoucher: (id) => apiRequest(`/api/workshops/${id}/vouchers/me`),
  createVoucher: (id, data) => apiRequest(`/api/workshops/${id}/vouchers`, { method: 'POST', body: JSON.stringify(data) }),
  sendVoucherToAttendees: (id, voucherId) => apiRequest(`/api/workshops/${id}/vouchers/${voucherId}/send`, { method: 'POST' }),
};

export default workshopAPI;


























