import { apiRequest } from './apiClient';
import { apiUpload } from './apiUpload';

// Tutor API
export const tutorAPI = {
  // Get tutor's assigned batches with module offerings
  getMyBatches: async () => {
    return apiRequest('/api/tutors/batches');
  },

  // Get tutor's sessions (all sessions where tutor is assigned)
  getMySessions: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.batchId) queryParams.append('batchId', filters.batchId);
    if (filters.moduleId) queryParams.append('moduleId', filters.moduleId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const queryString = queryParams.toString();
    return apiRequest(`/api/tutors/sessions${queryString ? `?${queryString}` : ''}`);
  },

  // Get tutor's module offerings (batches and modules assigned to tutor)
  getMyModuleOfferings: async () => {
    return apiRequest('/api/tutors/module-offerings');
  },

  // Get students for a specific batch/module
  getBatchStudents: async (batchId) => {
    return apiRequest(`/api/tutors/batches/${batchId}/students`);
  },

  // Get session details
  getSession: async (sessionId) => {
    return apiRequest(`/api/tutors/sessions/${sessionId}`);
  },

  // Update session (limited fields like meeting link, recording URL)
  updateSession: async (sessionId, sessionData) => {
    return apiRequest(`/api/tutors/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  },

  // Upload session recording (video) and auto-save recordingUrl on the session
  uploadSessionRecording: async (sessionId, file) => {
    const form = new FormData();
    form.append('file', file);
    return apiUpload(`/api/tutors/sessions/${sessionId}/recording`, form);
  },

  // Get tutor's program modules with learning objectives
  getMyProgramModules: async () => {
    return apiRequest('/api/tutors/program-modules');
  },
};

export default tutorAPI;

