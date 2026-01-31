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

export default auditAPI;

