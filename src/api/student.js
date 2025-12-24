import { apiRequest } from './apiClient';

// Student API
export const studentAPI = {
  // Get student's enrolled programs with modules, assignments, and sessions
  getMyPrograms: async () => {
    return apiRequest('/api/students/programs');
  },

  // Get student's sessions
  getMySessions: async () => {
    return apiRequest('/api/students/sessions');
  },

  // Get student's assignments
  getMyAssignments: async () => {
    return apiRequest('/api/students/assignments');
  },
};

export default studentAPI;

