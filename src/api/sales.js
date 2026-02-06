import { apiRequest } from './apiClient';

// Sales API
export const salesAPI = {
  getSalesMetrics: async () => {
    return apiRequest('/api/sales/metrics');
  },
};

export default salesAPI;

