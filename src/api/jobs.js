import { API_BASE_URL } from './constant';
import { apiRequest } from './apiClient';

// Public (no auth) - list open jobs
export const getPublicJobs = async (params = {}) => {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE_URL}/api/public/jobs?${sp}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load jobs');
  return data;
};

// Public - get single job
export const getPublicJobById = async (jobId) => {
  const res = await fetch(`${API_BASE_URL}/api/public/jobs/${jobId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load job');
  return data;
};

// Public - submit application (optional resume file via FormData)
export const submitJobApplication = async (jobId, formData) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/api/public/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: formData instanceof FormData ? {} : { 'Content-Type': 'application/json', ...headers },
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit application');
  return data;
};

// Public - upload resume only (returns URL)
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch(`${API_BASE_URL}/api/public/jobs/upload-resume`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload resume');
  return data;
};

// HR (authenticated) - jobs API
export const jobsAPI = {
  list: (params = {}) => {
    const sp = new URLSearchParams(params);
    return apiRequest(`/api/jobs?${sp}`);
  },
  getById: (jobId) => apiRequest(`/api/jobs/${jobId}`),
  create: (body) => apiRequest('/api/jobs', { method: 'POST', body: JSON.stringify(body) }),
  update: (jobId, body) => apiRequest(`/api/jobs/${jobId}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (jobId) => apiRequest(`/api/jobs/${jobId}`, { method: 'DELETE' }),
  getApplications: (jobId, params = {}) => {
    const sp = new URLSearchParams(params);
    return apiRequest(`/api/jobs/${jobId}/applications?${sp}`);
  },
};
