import { apiRequest } from './apiClient';

export const bugReportAPI = {
  submit: (data) =>
    apiRequest('/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        description: data.description,
        pageUrl: data.pageUrl ?? undefined,
      }),
    }),
};

export default bugReportAPI;
