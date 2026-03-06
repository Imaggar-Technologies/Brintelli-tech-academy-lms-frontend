import { apiRequest } from './apiClient';

export const referralAPI = {
  getMyReferral: () => apiRequest('/api/referrals/me'),
  ensureCode: () => apiRequest('/api/referrals/ensure-code', { method: 'POST' }),
};

export default referralAPI;
