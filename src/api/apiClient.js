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
    window.location.href = '/auth/signin';
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
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && authToken && endpoint !== '/api/auth/refresh') {
      try {
        const newToken = await refreshAuthToken();
        return makeRequest(newToken);
      } catch (refreshError) {
        throw new Error(data?.error || data?.message || 'Authentication failed');
      }
    }

    if (!response.ok) {
      const message = data?.error || data?.message || response.statusText || 'Request failed';
      throw new Error(typeof message === 'string' ? message : 'Request failed');
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

/** Fetch endpoint with auth and return response as blob (e.g. PDF download) */
export const apiRequestBlob = async (endpoint) => {
  let token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401 && token) {
    try {
      token = await refreshAuthToken();
      return apiRequestBlob(endpoint);
    } catch {
      throw new Error('Authentication failed');
    }
  }
  if (!res.ok) throw new Error(res.statusText || 'Download failed');
  return res.blob();
};

export default apiRequest;

