import { apiRequest } from './apiClient';

export const jobDrivesAPI = {
  list: (params = {}) => {
    const sp = new URLSearchParams(params);
    return apiRequest(`/api/job-drives?${sp}`);
  },
  getById: (driveId) => apiRequest(`/api/job-drives/${driveId}`),
  create: (body) => apiRequest('/api/job-drives', { method: 'POST', body: JSON.stringify(body) }),
  update: (driveId, body) => apiRequest(`/api/job-drives/${driveId}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (driveId) => apiRequest(`/api/job-drives/${driveId}`, { method: 'DELETE' }),
};
