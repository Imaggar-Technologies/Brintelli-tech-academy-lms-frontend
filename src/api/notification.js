import { apiRequest } from './apiClient';

const notificationApi = {
  /**
   * Get notifications for current user
   */
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.read !== undefined) params.append('read', filters.read);
    if (filters.type) params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit);
    
    return apiRequest(`/api/notifications?${params.toString()}`);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    return apiRequest('/api/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    return apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    return apiRequest('/api/notifications/read-all', {
      method: 'PUT',
    });
  },
};

export default notificationApi;

