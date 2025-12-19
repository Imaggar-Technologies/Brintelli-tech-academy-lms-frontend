import { API_ENDPOINTS } from './constant';
import { apiRequest } from './apiClient';

// User API
export const userAPI = {
  getCurrentUser: async () => {
    return apiRequest(API_ENDPOINTS.USERS.GET_ME);
  },

  getUser: async (userId) => {
    return apiRequest(API_ENDPOINTS.USERS.GET_USER(userId));
  },

  updateUser: async (userId, userData) => {
    return apiRequest(API_ENDPOINTS.USERS.GET_USER(userId), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getUsersByRole: async (role) => {
    return apiRequest(API_ENDPOINTS.USERS.GET_BY_ROLE(role));
  },

  getSalesTeam: async () => {
    return apiRequest(API_ENDPOINTS.USERS.GET_SALES_TEAM);
  },
};

export default userAPI;

