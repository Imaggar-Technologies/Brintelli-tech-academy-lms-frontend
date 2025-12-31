import { apiRequest } from './apiClient';

// Student API
export const studentAPI = {
  // Get student's enrolled programs with modules, assignments, and sessions
  getMyPrograms: async () => {
    return apiRequest('/api/students/programs');
  },

  // Get a single program's details
  getProgramById: async (programId) => {
    const response = await apiRequest('/api/students/programs');
    if (response.success) {
      const program = response.data.programs?.find(
        p => p.program?.id === programId || p.program?._id === programId
      );
      return {
        success: true,
        data: { program }
      };
    }
    return response;
  },

  // Get student's sessions
  getMySessions: async () => {
    return apiRequest('/api/students/sessions');
  },

  // Get student's assignments
  getMyAssignments: async () => {
    return apiRequest('/api/students/assignments');
  },

  // Get student's enrollment with suggested mentors
  getMyEnrollment: async () => {
    return apiRequest('/api/students/enrollment');
  },

  // Book a call with a mentor
  bookMentorCall: async (mentorId) => {
    return apiRequest('/api/students/book-mentor-call', {
      method: 'POST',
      body: JSON.stringify({ mentorId }),
    });
  },

  // Select a mentor
  selectMentor: async (mentorId) => {
    return apiRequest('/api/students/select-mentor', {
      method: 'POST',
      body: JSON.stringify({ mentorId }),
    });
  },

  // Get available batches for student's program
  getAvailableBatches: async () => {
    return apiRequest('/api/students/available-batches');
  },

  // Confirm or change batch
  confirmBatch: async (batchId) => {
    return apiRequest('/api/students/confirm-batch', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
  },
};

export default studentAPI;

