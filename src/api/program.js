import { apiRequest } from './apiClient';

// Program Management API
export const programAPI = {
  // Programs
  createProgram: async (programData) => {
    return apiRequest('/api/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  },

  getAllPrograms: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return apiRequest(`/api/programs${queryString ? `?${queryString}` : ''}`);
  },

  getProgramById: async (programId) => {
    return apiRequest(`/api/programs/${programId}`);
  },

  updateProgram: async (programId, updates) => {
    return apiRequest(`/api/programs/${programId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Modules
  createModule: async (programId, moduleData) => {
    return apiRequest(`/api/programs/${programId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  },

  getModulesByProgram: async (programId) => {
    return apiRequest(`/api/programs/${programId}/modules`);
  },

  getModuleById: async (moduleId) => {
    // Since there's no direct endpoint, we'll need to search through modules
    // For now, we'll use a workaround by getting all modules and finding the one
    // This should be improved in the backend later
    return apiRequest(`/api/programs/modules/${moduleId}`);
  },

  updateModule: async (moduleId, updates) => {
    return apiRequest(`/api/programs/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Sessions
  createSession: async (moduleId, sessionData) => {
    return apiRequest(`/api/programs/modules/${moduleId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  getSessionsByModule: async (moduleId) => {
    return apiRequest(`/api/programs/modules/${moduleId}/sessions`);
  },

  updateSession: async (sessionId, updates) => {
    return apiRequest(`/api/programs/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Assignments
  createAssignment: async (moduleId, assignmentData) => {
    return apiRequest(`/api/programs/modules/${moduleId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  getAssignmentsByModule: async (moduleId) => {
    return apiRequest(`/api/programs/modules/${moduleId}/assignments`);
  },

  updateAssignment: async (assignmentId, updates) => {
    return apiRequest(`/api/programs/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

export default programAPI;

