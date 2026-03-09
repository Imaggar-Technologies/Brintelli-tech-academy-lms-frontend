import { apiRequest } from './apiClient';
import { apiUpload } from './apiUpload';

const marketingAPI = {
  getMyCreator: () => apiRequest('/api/marketing/creator'),
  getNewUsers: (params) => apiRequest(`/api/marketing/new-users?${new URLSearchParams(params || {}).toString()}`),

  /** Upload Excel for high-value contacts (HOD, Dean, etc.). Returns { count, pointsAwarded }. */
  uploadHighValueContacts: (file) => {
    const form = new FormData();
    form.append('file', file);
    return apiUpload('/api/marketing/assets/high-value/upload', form);
  },

  /** Upload Excel for student/leads database. Returns { count }. */
  uploadStudentLeads: (file) => {
    const form = new FormData();
    form.append('file', file);
    return apiUpload('/api/marketing/assets/leads/upload', form);
  },
};

export default marketingAPI;
