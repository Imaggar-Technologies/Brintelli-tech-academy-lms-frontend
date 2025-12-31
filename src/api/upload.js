import { apiRequest } from './apiClient';
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

export const uploadAPI = {
  /**
   * Upload a file to S3
   * @param {File} file - The file to upload
   * @param {string} folder - Optional folder path in S3 (e.g., 'program-resources')
   * @returns {Promise<{success: boolean, data: {url: string, key: string}}>}
   */
  uploadFile: async (file, folder = 'program-resources') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    let token = getAuthToken();

    const makeUploadRequest = async (authToken) => {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({ error: 'Upload failed' }));

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && authToken) {
        try {
          // Attempt to refresh token
          const newToken = await refreshAuthToken();
          // Retry the original request with new token
          // Note: We need to recreate FormData as it can't be reused
          const retryFormData = new FormData();
          retryFormData.append('file', file);
          retryFormData.append('folder', folder);
          
          const retryResponse = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
              ...(newToken && { 'Authorization': `Bearer ${newToken}` }),
            },
            body: retryFormData,
          });

          const retryData = await retryResponse.json().catch(() => ({ error: 'Upload failed' }));

          if (!retryResponse.ok) {
            throw new Error(retryData.error || retryData.message || 'Upload failed');
          }

          return retryData;
        } catch (refreshError) {
          // Refresh failed, throw original error
          throw new Error(data.error || data.message || 'Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      return data;
    };

    try {
      return await makeUploadRequest(token);
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files to upload
   * @param {string} folder - Optional folder path in S3
   * @returns {Promise<Array<{url: string, key: string}>>}
   */
  uploadFiles: async (files, folder = 'program-resources') => {
    const uploadPromises = files.map(file => uploadAPI.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<{success: boolean}>}
   */
  deleteFile: async (key) => {
    return apiRequest('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ key }),
    });
  },

  /**
   * Get upload service status (S3 or local)
   * @returns {Promise<{success: boolean, data: {storageType: string, s3Configured: boolean}}>}
   */
  getStatus: async () => {
    return apiRequest('/api/upload/status');
  },

  /**
   * Test S3 connection and permissions
   * @returns {Promise<{success: boolean, message: string}>}
   */
  testConnection: async () => {
    return apiRequest('/api/upload/test', {
      method: 'POST',
    });
  },

  /**
   * Get presigned URL for S3 file (bypasses CORS)
   * @param {string} key - S3 object key
   * @returns {Promise<{success: boolean, data: {url: string, expiresIn: number}}>}
   */
  getPresignedUrl: async (key) => {
    return apiRequest(`/api/upload/presigned-url?key=${encodeURIComponent(key)}`);
  },

  /**
   * Get proxy URL for S3 file (bypasses CORS completely)
   * @param {string} key - S3 object key
   * @returns {string} Proxy URL
   */
  getProxyUrl: (key) => {
    return `${API_BASE_URL}/api/upload/proxy/${encodeURIComponent(key)}`;
  },
};

export default uploadAPI;

