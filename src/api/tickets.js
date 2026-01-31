import { apiRequest } from './apiClient';

// Ticket API
export const ticketAPI = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    return apiRequest('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  // Get all tickets (filtered by role)
  getTickets: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/tickets${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get ticket by ID
  getTicketById: async (ticketId) => {
    return apiRequest(`/api/tickets/${ticketId}`);
  },

  // Update ticket
  updateTicket: async (ticketId, updates) => {
    return apiRequest(`/api/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Assign ticket
  assignTicket: async (ticketId, assigneeId) => {
    return apiRequest(`/api/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
    });
  },

  // Update ticket status
  updateStatus: async (ticketId, status, resolutionNotes = null) => {
    return apiRequest(`/api/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  },

  // Add comment
  addComment: async (ticketId, comment) => {
    return apiRequest(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // Add internal comment
  addInternalComment: async (ticketId, comment) => {
    return apiRequest(`/api/tickets/${ticketId}/internal-comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // Resolve ticket
  resolveTicket: async (ticketId, resolutionNotes = null) => {
    return apiRequest(`/api/tickets/${ticketId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  },

  // Close ticket
  closeTicket: async (ticketId) => {
    return apiRequest(`/api/tickets/${ticketId}/close`, {
      method: 'POST',
    });
  },
};

export default ticketAPI;

