import { apiRequest } from './apiClient';

// Session API for bookmarks, notices, resources, quizzes
export const sessionAPI = {
  // ========== Bookmarks ==========
  createBookmark: async (sessionId, bookmarkData) => {
    return apiRequest(`/api/sessions/${sessionId}/bookmarks`, {
      method: 'POST',
      body: JSON.stringify(bookmarkData),
    });
  },

  getBookmarks: async (sessionId, userId = null) => {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest(`/api/sessions/${sessionId}/bookmarks${params}`);
  },

  updateBookmark: async (bookmarkId, bookmarkData) => {
    return apiRequest(`/api/sessions/bookmarks/${bookmarkId}`, {
      method: 'PUT',
      body: JSON.stringify(bookmarkData),
    });
  },

  deleteBookmark: async (bookmarkId) => {
    return apiRequest(`/api/sessions/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  },

  // ========== Resources ==========
  createResource: async (sessionId, resourceData) => {
    return apiRequest(`/api/sessions/${sessionId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },

  getResources: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/resources`);
  },

  updateResource: async (resourceId, resourceData) => {
    return apiRequest(`/api/sessions/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  deleteResource: async (resourceId) => {
    return apiRequest(`/api/sessions/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },

  // ========== Notice Board ==========
  createNotice: async (sessionId, noticeData) => {
    return apiRequest(`/api/sessions/${sessionId}/notices`, {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  },

  getNotices: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/notices`);
  },

  updateNotice: async (noticeId, noticeData) => {
    return apiRequest(`/api/sessions/notices/${noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    });
  },

  deleteNotice: async (noticeId) => {
    return apiRequest(`/api/sessions/notices/${noticeId}`, {
      method: 'DELETE',
    });
  },

  // ========== Quizzes ==========
  createQuiz: async (sessionId, quizData) => {
    return apiRequest(`/api/sessions/${sessionId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  getQuizzes: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/quizzes`);
  },

  updateQuizVote: async (sessionId, quizId, optionIndex) => {
    return apiRequest(`/api/sessions/${sessionId}/quizzes/${quizId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    });
  },

  // ========== Preparation Workflow ==========
  updatePreparation: async (sessionId, preparationData) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation`, {
      method: 'PUT',
      body: JSON.stringify(preparationData),
    });
  },

  markPreparationComplete: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation/complete`, {
      method: 'POST',
    });
  },

  submitPreparationForApproval: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation/submit`, {
      method: 'POST',
    });
  },

  approvePreparation: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation/approve`, {
      method: 'POST',
    });
  },

  rejectPreparation: async (sessionId, reason) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  enableSession: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/enable`, {
      method: 'POST',
    });
  },

  terminateSession: async (sessionId, reason) => {
    return apiRequest(`/api/sessions/${sessionId}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getPreparation: async (sessionId) => {
    return apiRequest(`/api/sessions/${sessionId}/preparation`);
  },
};

export default sessionAPI;

