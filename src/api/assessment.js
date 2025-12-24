import { API_ENDPOINTS } from './constant';
import { apiRequest } from './apiClient';

// Assessment API
export const assessmentAPI = {
  // Get all assessments
  getAllAssessments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.leadId) params.append('leadId', filters.leadId);
    if (filters.status) params.append('status', filters.status);
    if (filters.assessmentType) params.append('assessmentType', filters.assessmentType);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    
    const queryString = params.toString();
    return apiRequest(`/api/assessments${queryString ? `?${queryString}` : ''}`);
  },

  // Get assessment by ID
  getAssessmentById: async (assessmentId) => {
    return apiRequest(`/api/assessments/${assessmentId}`);
  },

  // Get all assessments for a lead
  getAssessmentsByLead: async (leadId) => {
    return apiRequest(`/api/assessments/lead/${leadId}`);
  },

  // Create assessment for a lead
  createAssessment: async (leadId, assessmentData) => {
    return apiRequest(`/api/assessments/lead/${leadId}`, {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  },

  // Submit assessment answers
  submitAnswers: async (assessmentId, answersData) => {
    return apiRequest(`/api/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(answersData),
    });
  },

  // Update assessment score
  updateScore: async (assessmentId, scoreData) => {
    return apiRequest(`/api/assessments/${assessmentId}/score`, {
      method: 'PUT',
      body: JSON.stringify(scoreData),
    });
  },

  // Evaluate assessment
  evaluateAssessment: async (assessmentId, evaluationData) => {
    return apiRequest(`/api/assessments/${assessmentId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  },

  // Get assessment questions
  getAssessmentQuestions: async (assessmentId) => {
    return apiRequest(`/api/assessments/${assessmentId}/questions`);
  },

  // Get assessment result
  getAssessmentResult: async (assessmentId) => {
    return apiRequest(`/api/assessments/${assessmentId}/result`);
  },

  // Reschedule assessment
  rescheduleAssessment: async (assessmentId, daysToAdd = 7) => {
    return apiRequest(`/api/assessments/${assessmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ daysToAdd }),
    });
  },

  // Delete assessment
  deleteAssessment: async (assessmentId) => {
    return apiRequest(`/api/assessments/${assessmentId}`, {
      method: 'DELETE',
    });
  },
};

export default assessmentAPI;


