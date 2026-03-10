import { apiRequest } from './apiClient';
import { API_BASE_URL } from './constant';

/** Public (no auth) - list colleges for dropdowns e.g. career apply */
export const getPublicColleges = async (params = {}) => {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE_URL}/api/public/colleges?${sp}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load colleges');
  return data;
};

export const partnersAPI = {
  list: (params = {}) => {
    const sp = new URLSearchParams(params);
    return apiRequest(`/api/partners?${sp}`);
  },
  getById: (partnerId) => apiRequest(`/api/partners/${partnerId}`),
  create: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/api/partners`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => res.json()).then((data) => {
      if (!data.success) throw new Error(data.error || 'Failed to create partner');
      return data;
    });
  },
  update: (partnerId, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/api/partners/${partnerId}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => res.json()).then((data) => {
      if (!data.success) throw new Error(data.error || 'Failed to update partner');
      return data;
    });
  },
  delete: (partnerId) => apiRequest(`/api/partners/${partnerId}`, { method: 'DELETE' }),
  uploadLogo: (file) => {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('logo', file);
    return fetch(`${API_BASE_URL}/api/partners/upload-logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then((res) => res.json()).then((data) => {
      if (!data.success) throw new Error(data.error || 'Failed to upload logo');
      return data;
    });
  },
};
