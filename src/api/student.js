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

  // Revoke/remove current mentor
  revokeMentor: async (mentorId) => {
    return apiRequest('/api/students/revoke-mentor', {
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

  // Get assessments allocated to this student (from lead/sales)
  getMyAssessments: async () => {
    return apiRequest('/api/students/assessments');
  },

  // Check if prerequisite courses are met (for Fees & Onboarding access)
  getPrerequisitesStatus: async () => {
    return apiRequest('/api/students/prerequisites-status');
  },

  // All vouchers sent to this learner (tutor/admin/Brintelli); expired listed first
  getMyVouchers: async () => {
    return apiRequest('/api/students/vouchers');
  },

  // Social follow challenges: follow Brintelli on LinkedIn, Instagram, GitHub, etc.; earn 20 pts per platform
  getSocialFollowSubmissions: async () => {
    return apiRequest('/api/students/social-follow');
  },
  submitSocialFollow: async (platform, screenshotUrl) => {
    return apiRequest('/api/students/social-follow', {
      method: 'POST',
      body: JSON.stringify({ platform, screenshotUrl: screenshotUrl || undefined }),
    });
  },
};

export default studentAPI;

