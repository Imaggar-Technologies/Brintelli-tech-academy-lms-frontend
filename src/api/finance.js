import { apiRequest } from './apiClient';
import { downloadBlob } from './constant';

// Finance API - Aggregated endpoints for finance dashboard
export const financeAPI = {
  // Get finance dashboard stats
  getDashboardStats: async () => {
    return apiRequest('/api/finance/dashboard/stats');
  },

  // Get revenue analytics
  getRevenueAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.courseId) params.append('courseId', filters.courseId);
    
    const queryString = params.toString();
    return apiRequest(`/api/finance/revenue/analytics${queryString ? `?${queryString}` : ''}`);
  },

  // Get payment history
  getPaymentHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    
    const queryString = params.toString();
    return apiRequest(`/api/finance/payments/history${queryString ? `?${queryString}` : ''}`);
  },

  // Get outstanding dues
  getOutstandingDues: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.view) params.append('view', filters.view); // all, overdue, critical
    if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue);
    
    const queryString = params.toString();
    return apiRequest(`/api/finance/dues${queryString ? `?${queryString}` : ''}`);
  },

  // Send reminder for due
  sendDueReminder: async (offerId, reminderData = {}) => {
    return apiRequest(`/api/finance/dues/${offerId}/reminder`, {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  },

  // Add follow-up note for due
  addFollowUpNote: async (offerId, noteData) => {
    return apiRequest(`/api/finance/dues/${offerId}/follow-up`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Escalate due to finance head
  escalateDue: async (offerId, escalationData = {}) => {
    return apiRequest(`/api/finance/dues/${offerId}/escalate`, {
      method: 'POST',
      body: JSON.stringify(escalationData),
    });
  },

  // Export reports
  exportReport: async (reportType, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    const endpoint = `/api/finance/reports/${reportType}/export${queryString ? `?${queryString}` : ''}`;
    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return downloadBlob(endpoint, filename);
  },
};

export default financeAPI;

