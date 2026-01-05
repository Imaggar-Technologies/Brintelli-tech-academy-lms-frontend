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

  // Sub-Modules
  createSubModule: async (moduleId, subModuleData) => {
    return apiRequest(`/api/programs/modules/${moduleId}/submodules`, {
      method: 'POST',
      body: JSON.stringify(subModuleData),
    });
  },

  getSubModulesByModule: async (moduleId) => {
    return apiRequest(`/api/programs/modules/${moduleId}/submodules`);
  },

  getSubModuleById: async (subModuleId) => {
    return apiRequest(`/api/programs/submodules/${subModuleId}`);
  },

  updateSubModule: async (subModuleId, updates) => {
    return apiRequest(`/api/programs/submodules/${subModuleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteSubModule: async (subModuleId) => {
    return apiRequest(`/api/programs/submodules/${subModuleId}`, {
      method: 'DELETE',
    });
  },

  // Sub-Module Objectives
  createSubModuleObjective: async (subModuleId, objectiveData) => {
    return apiRequest(`/api/programs/submodules/${subModuleId}/objectives`, {
      method: 'POST',
      body: JSON.stringify(objectiveData),
    });
  },

  getSubModuleObjectives: async (subModuleId) => {
    return apiRequest(`/api/programs/submodules/${subModuleId}/objectives`);
  },

  updateSubModuleObjective: async (objectiveId, updates) => {
    return apiRequest(`/api/programs/submodule-objectives/${objectiveId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteSubModuleObjective: async (objectiveId) => {
    return apiRequest(`/api/programs/submodule-objectives/${objectiveId}`, {
      method: 'DELETE',
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

  // Objectives
  createObjective: async (moduleId, objectiveData) => {
    return apiRequest(`/api/programs/modules/${moduleId}/objectives`, {
      method: 'POST',
      body: JSON.stringify(objectiveData),
    });
  },

  getObjectivesByModule: async (moduleId) => {
    return apiRequest(`/api/programs/modules/${moduleId}/objectives`);
  },

  updateObjective: async (objectiveId, updates) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteObjective: async (objectiveId) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}`, {
      method: 'DELETE',
    });
  },

  // Resources
  createResource: async (objectiveId, resourceData) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },

  updateResource: async (resourceId, resourceData) => {
    return apiRequest(`/api/programs/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  deleteResource: async (resourceId) => {
    return apiRequest(`/api/programs/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },

  // Objective Assignments
  createObjectiveAssignment: async (objectiveId, assignmentData) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  updateObjectiveAssignment: async (assignmentId, assignmentData) => {
    return apiRequest(`/api/programs/objective-assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  deleteObjectiveAssignment: async (assignmentId) => {
    return apiRequest(`/api/programs/objective-assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  },

  // Practice Codes
  createPracticeCode: async (objectiveId, practiceCodeData) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}/practice-codes`, {
      method: 'POST',
      body: JSON.stringify(practiceCodeData),
    });
  },

  updatePracticeCode: async (practiceCodeId, practiceCodeData) => {
    return apiRequest(`/api/programs/practice-codes/${practiceCodeId}`, {
      method: 'PUT',
      body: JSON.stringify(practiceCodeData),
    });
  },

  deletePracticeCode: async (practiceCodeId) => {
    return apiRequest(`/api/programs/practice-codes/${practiceCodeId}`, {
      method: 'DELETE',
    });
  },

  // MCQs
  createMCQ: async (objectiveId, mcqData) => {
    return apiRequest(`/api/programs/objectives/${objectiveId}/mcqs`, {
      method: 'POST',
      body: JSON.stringify(mcqData),
    });
  },

  updateMCQ: async (mcqId, mcqData) => {
    return apiRequest(`/api/programs/mcqs/${mcqId}`, {
      method: 'PUT',
      body: JSON.stringify(mcqData),
    });
  },

  deleteMCQ: async (mcqId) => {
    return apiRequest(`/api/programs/mcqs/${mcqId}`, {
      method: 'DELETE',
    });
  },
};

export default programAPI;

