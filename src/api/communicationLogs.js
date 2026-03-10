import { apiRequest } from './apiClient';

export const communicationLogsAPI = {
  list: (params = {}) => {
    const sp = new URLSearchParams(params);
    return apiRequest(`/api/communication-logs?${sp}`);
  },
  create: (body) =>
    apiRequest('/api/communication-logs', {
      method: 'POST',
      body: JSON.stringify({
        title: body.title,
        message: body.message,
        audienceTypes: body.audienceTypes || [],
      }),
    }),
};
