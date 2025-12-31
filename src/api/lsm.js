import { apiRequest } from './apiClient';

// LSM API
export const lsmAPI = {
  // Get pending onboarding students
  getPendingOnboarding: async () => {
    return apiRequest('/api/lsm/onboarding/pending');
  },

  // Get all batches
  getAllBatches: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return apiRequest(`/api/lsm/batches${queryString ? `?${queryString}` : ''}`);
  },

  // Get all mentors
  getAllMentors: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    
    const queryString = params.toString();
    return apiRequest(`/api/lsm/mentors${queryString ? `?${queryString}` : ''}`);
  },

  // Allocate batch to student
  allocateBatch: async (enrollmentId, batchData) => {
    return apiRequest(`/api/lsm/enrollments/${enrollmentId}/allocate-batch`, {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },

  // Suggest mentors to student
  suggestMentors: async (enrollmentId, mentorData) => {
    return apiRequest(`/api/lsm/enrollments/${enrollmentId}/suggest-mentors`, {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  },

  // Allocate student (batch, course, mentor) - kept for backward compatibility
  allocateStudent: async (enrollmentId, allocationData) => {
    return apiRequest(`/api/lsm/enrollments/${enrollmentId}/allocate`, {
      method: 'POST',
      body: JSON.stringify(allocationData),
    });
  },

  // Complete onboarding
  completeOnboarding: async (enrollmentId) => {
    return apiRequest(`/api/lsm/enrollments/${enrollmentId}/complete`, {
      method: 'POST',
    });
  },

  // Student selects mentor
  selectMentor: async (enrollmentId, mentorId) => {
    return apiRequest(`/api/lsm/enrollments/${enrollmentId}/select-mentor`, {
      method: 'POST',
      body: JSON.stringify({ mentorId }),
    });
  },

  // Create batch
  createBatch: async (batchData) => {
    return apiRequest('/api/lsm/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },

  // Get enrolled students for a batch
  getBatchStudents: async (batchId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/students`);
  },

  // Get batch sessions
  getBatchSessions: async (batchId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/sessions`);
  },

  // Create session
  createSession: async (batchId, sessionData) => {
    return apiRequest(`/api/lsm/batches/${batchId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  // Update session
  updateSession: async (sessionId, sessionData) => {
    return apiRequest(`/api/lsm/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  },

  // Delete session
  deleteSession: async (sessionId) => {
    return apiRequest(`/api/lsm/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // ==================== MODULE OFFERINGS ====================
  // Assign tutor to a module for a batch (Create/Update Module Offering)
  assignTutorToModule: async (batchId, moduleId, tutorId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/module-offerings`, {
      method: 'POST',
      body: JSON.stringify({ moduleId, tutorId }),
    });
  },

  // Get all module offerings for a batch
  getBatchModuleOfferings: async (batchId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/module-offerings`);
  },

  // Get a specific module offering
  getModuleOffering: async (batchId, moduleId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/module-offerings/${moduleId}`);
  },

  // Remove tutor assignment from a module
  removeTutorFromModule: async (batchId, moduleId) => {
    return apiRequest(`/api/lsm/batches/${batchId}/module-offerings/${moduleId}`, {
      method: 'DELETE',
    });
  },

  // ==================== STUDENT PROFILES ====================
  getStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/students${queryString ? `?${queryString}` : ''}`);
  },

  getStudentById: async (id) => {
    return apiRequest(`/api/lsm/students/${id}`);
  },

  createStudent: async (data) => {
    return apiRequest('/api/lsm/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStudent: async (id, data) => {
    return apiRequest(`/api/lsm/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ==================== RISK STUDENTS ====================
  getRiskStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/risk${queryString ? `?${queryString}` : ''}`);
  },

  createRisk: async (data) => {
    return apiRequest('/api/lsm/risk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRisk: async (id, data) => {
    return apiRequest(`/api/lsm/risk/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  addRiskSignal: async (id, signal) => {
    return apiRequest(`/api/lsm/risk/${id}/signal`, {
      method: 'POST',
      body: JSON.stringify({ signal }),
    });
  },

  // ==================== ESCALATIONS ====================
  getEscalations: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/escalations${queryString ? `?${queryString}` : ''}`);
  },

  createEscalation: async (data) => {
    return apiRequest('/api/lsm/escalations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEscalation: async (id, data) => {
    return apiRequest(`/api/lsm/escalations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  addEscalationComment: async (id, comment, authorId) => {
    return apiRequest(`/api/lsm/escalations/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment, authorId }),
    });
  },

  // ==================== ONE-ON-ONE ====================
  getOneOnOnes: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/oneonone${queryString ? `?${queryString}` : ''}`);
  },

  createOneOnOne: async (data) => {
    return apiRequest('/api/lsm/oneonone', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOneOnOne: async (id, data) => {
    return apiRequest(`/api/lsm/oneonone/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ==================== SESSION LOGS ====================
  getSessionLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/session-logs${queryString ? `?${queryString}` : ''}`);
  },

  createSessionLog: async (data) => {
    return apiRequest('/api/lsm/session-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== ENGAGEMENT ====================
  getEngagement: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/engagement${queryString ? `?${queryString}` : ''}`);
  },

  createEngagement: async (data) => {
    return apiRequest('/api/lsm/engagement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== PROGRESS ====================
  getProgress: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/progress${queryString ? `?${queryString}` : ''}`);
  },

  createProgress: async (data) => {
    return apiRequest('/api/lsm/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== ATTENDANCE ====================
  getAttendance: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/attendance${queryString ? `?${queryString}` : ''}`);
  },

  markAttendance: async (data) => {
    return apiRequest('/api/lsm/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== PERFORMANCE ====================
  getPerformance: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/performance${queryString ? `?${queryString}` : ''}`);
  },

  createPerformance: async (data) => {
    return apiRequest('/api/lsm/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== WEEKLY REPORTS ====================
  getWeeklyReports: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/weekly-reports${queryString ? `?${queryString}` : ''}`);
  },

  generateWeeklyReport: async (data) => {
    return apiRequest('/api/lsm/weekly-reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== READINESS ====================
  getReadiness: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/readiness${queryString ? `?${queryString}` : ''}`);
  },

  recomputeReadiness: async (data) => {
    return apiRequest('/api/lsm/readiness/recompute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== INTERVIEW PREP ====================
  getInterviewPrep: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/lsm/interview-prep${queryString ? `?${queryString}` : ''}`);
  },

  createInterviewPrep: async (data) => {
    return apiRequest('/api/lsm/interview-prep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateInterviewPrep: async (id, data) => {
    return apiRequest(`/api/lsm/interview-prep/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  addInterviewPrepFeedback: async (id, feedback, authorId) => {
    return apiRequest(`/api/lsm/interview-prep/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback, authorId }),
    });
  },
};

export default lsmAPI;

