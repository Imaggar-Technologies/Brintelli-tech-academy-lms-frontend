import { API_ENDPOINTS } from './constant';
import { apiRequest } from './apiClient';

// Lead API
export const leadAPI = {
  getAllLeads: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return apiRequest(`/api/leads${queryString ? `?${queryString}` : ''}`);
  },

  getLeadById: async (leadId) => {
    return apiRequest(`/api/leads/${leadId}`);
  },

  createLead: async (leadData) => {
    return apiRequest('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  updateLead: async (leadId, updates) => {
    return apiRequest(`/api/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  assignLead: async (leadId, assignedTo) => {
    return apiRequest(`/api/leads/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    });
  },

  updatePreScreening: async (leadId, preScreeningData) => {
    return apiRequest(`/api/leads/${leadId}/pre-screening`, {
      method: 'PUT',
      body: JSON.stringify(preScreeningData),
    });
  },

  deleteLead: async (leadId) => {
    return apiRequest(`/api/leads/${leadId}`, {
      method: 'DELETE',
    });
  },

  updatePipelineStage: async (leadId, pipelineStage) => {
    return apiRequest(`/api/leads/${leadId}/pipeline-stage`, {
      method: 'PUT',
      body: JSON.stringify({ pipelineStage }),
    });
  },

  addCallNotes: async (leadId, callNoteData) => {
    return apiRequest(`/api/leads/${leadId}/call-notes`, {
      method: 'POST',
      body: JSON.stringify(callNoteData),
    });
  },

  submitCallNotesAndMoveToAssessments: async (leadId, callNoteData, assessmentBooking = {}) => {
    return apiRequest(`/api/leads/${leadId}/submit-call-notes`, {
      method: 'POST',
      body: JSON.stringify({ 
        ...callNoteData,
        ...assessmentBooking,
      }),
    });
  },

  sendAssessment: async (leadId, assessmentData) => {
    return apiRequest(`/api/leads/${leadId}/send-assessment`, {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  },
  flagLead: async (leadId, flagData) => {
    return apiRequest(`/api/leads/${leadId}/flag`, {
      method: 'POST',
      body: JSON.stringify(flagData),
    });
  },
  removeFlag: async (leadId) => {
    return apiRequest(`/api/leads/${leadId}/flag`, {
      method: 'DELETE',
    });
  },
  bookDemo: async (leadId, demoData) => {
    return apiRequest(`/api/leads/${leadId}/book-demo`, {
      method: 'POST',
      body: JSON.stringify(demoData),
    });
  },
  bookCounseling: async (leadId, counselingData) => {
    return apiRequest(`/api/leads/${leadId}/book-counseling`, {
      method: 'POST',
      body: JSON.stringify(counselingData),
    });
  },
  submitDemoReport: async (leadId, report) => {
    return apiRequest(`/api/leads/${leadId}/demo-report`, {
      method: 'POST',
      body: JSON.stringify({ report }),
    });
  },
  submitCounselingReport: async (leadId, report) => {
    return apiRequest(`/api/leads/${leadId}/counseling-report`, {
      method: 'POST',
      body: JSON.stringify({ report }),
    });
  },
  rescheduleDemo: async (leadId, demoData) => {
    return apiRequest(`/api/leads/${leadId}/reschedule-demo`, {
      method: 'PUT',
      body: JSON.stringify(demoData),
    });
  },
  rescheduleCounseling: async (leadId, counselingData) => {
    return apiRequest(`/api/leads/${leadId}/reschedule-counseling`, {
      method: 'PUT',
      body: JSON.stringify(counselingData),
    });
  },
  updateAssessmentMarks: async (leadId, assessmentData) => {
    return apiRequest(`/api/leads/${leadId}/assessment-marks`, {
      method: 'PUT',
      body: JSON.stringify(assessmentData),
    });
  },
};

export default leadAPI;

