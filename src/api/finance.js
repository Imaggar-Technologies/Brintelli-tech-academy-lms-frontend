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

  // ==================== INVOICE APIs ====================
  createInvoice: async (invoiceData) => {
    return apiRequest('/api/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return apiRequest(`/api/finance/invoices${queryString ? `?${queryString}` : ''}`);
  },

  getInvoiceById: async (id) => {
    return apiRequest(`/api/finance/invoices/${id}`);
  },

  downloadInvoicePDF: async (id) => {
    const filename = `invoice-${id}-${new Date().toISOString().split('T')[0]}.pdf`;
    return downloadBlob(`/api/finance/invoices/${id}/pdf`, filename);
  },

  updateInvoice: async (id, updates) => {
    return apiRequest(`/api/finance/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // ==================== PAYMENT APIs ====================
  createPayment: async (paymentData) => {
    return apiRequest('/api/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return apiRequest(`/api/finance/payments${queryString ? `?${queryString}` : ''}`);
  },

  getPaymentById: async (id) => {
    return apiRequest(`/api/finance/payments/${id}`);
  },

  // ==================== INSTALLMENT APIs ====================
  createInstallmentSchedule: async (scheduleData) => {
    return apiRequest('/api/finance/installments/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  getInstallments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return apiRequest(`/api/finance/installments${queryString ? `?${queryString}` : ''}`);
  },

  getOverdueInstallments: async () => {
    return apiRequest('/api/finance/installments/overdue');
  },

  updateInstallment: async (id, updates) => {
    return apiRequest(`/api/finance/installments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // ==================== TRANSACTION APIs ====================
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return apiRequest(`/api/finance/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionById: async (id) => {
    return apiRequest(`/api/finance/transactions/${id}`);
  },

  // ==================== REFUND APIs ====================
  createRefund: async (refundData) => {
    return apiRequest('/api/finance/refunds', {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  getRefunds: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return apiRequest(`/api/finance/refunds${queryString ? `?${queryString}` : ''}`);
  },

  getRefundById: async (id) => {
    return apiRequest(`/api/finance/refunds/${id}`);
  },

  approveRefund: async (id) => {
    return apiRequest(`/api/finance/refunds/${id}/approve`, {
      method: 'POST',
    });
  },

  processRefund: async (id, processData) => {
    return apiRequest(`/api/finance/refunds/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(processData),
    });
  },

  revokeRefund: async (id, reason) => {
    return apiRequest(`/api/finance/refunds/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // ==================== OVERDUE APIs ====================
  getOverdueItems: async () => {
    return apiRequest('/api/finance/overdue');
  },
};

export default financeAPI;

