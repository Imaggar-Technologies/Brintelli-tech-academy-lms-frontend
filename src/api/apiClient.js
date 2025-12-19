import { API_BASE_URL } from './constant';
import { store } from '../store';
import { selectToken, selectRefreshToken, logout, setCredentials } from '../store/slices/authSlice';

// Helper function to get auth token from Redux store
const getAuthToken = () => {
  const state = store.getState();
  return selectToken(state);
};

// Helper function to get refresh token from Redux store
const getRefreshToken = () => {
  const state = store.getState();
  return selectRefreshToken(state);
};

// Helper function to handle token refresh
const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Make refresh request directly (avoid circular dependency)
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Token refresh failed');
    }

    if (data.data) {
      // Update Redux store with new tokens
      store.dispatch(setCredentials({
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken || refreshToken,
      }));
      return data.data.token;
    }
    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('Token refresh error:', error);
    // Logout user if refresh fails
    store.dispatch(logout());
    window.location.href = '/switch-user';
    throw error;
  }
};

// Helper function to make API requests with automatic token refresh
export const apiRequest = async (endpoint, options = {}) => {
  let token = getAuthToken();
  
  const makeRequest = async (authToken) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && authToken && endpoint !== '/api/auth/refresh') {
      try {
        // Attempt to refresh token
        const newToken = await refreshAuthToken();
        // Retry the original request with new token
        return makeRequest(newToken);
      } catch (refreshError) {
        // Refresh failed, throw original error
        throw new Error(data.error || 'Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  };

  try {
    return await makeRequest(token);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default apiRequest;

