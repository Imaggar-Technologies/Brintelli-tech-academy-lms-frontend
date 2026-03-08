import { apiRequest } from './apiClient';

// Audit Log API
export const auditAPI = {
  // Get audit logs with filtering
  getAuditLogs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.targetUserId) queryParams.append('targetUserId', filters.targetUserId);
    if (filters.targetTicketId) queryParams.append('targetTicketId', filters.targetTicketId);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/audit/logs${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get audit log by ID
  getAuditLogById: async (logId) => {
    return apiRequest(`/api/audit/logs/${logId}`);
  },
};

// User activity (views, logins) for admin/LSM
export const userActivityAPI = {
  getByUser: async (userId, params = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.append('limit', params.limit);
    if (params.action) q.append('action', params.action);
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    const query = q.toString();
    return apiRequest(`/api/users/${userId}/activity${query ? `?${query}` : ''}`);
  },
};

export default auditAPI;

