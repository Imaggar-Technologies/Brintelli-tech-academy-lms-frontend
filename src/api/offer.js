import { apiRequest } from './apiClient';
import { downloadBlob } from './constant';

// Offer API
export const offerAPI = {
  // Release offer
  releaseOffer: async (offerData) => {
    return apiRequest('/api/offers/release', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },

  // Get all offers
  getAllOffers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.leadId) params.append('leadId', filters.leadId);
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.status) params.append('status', filters.status);
    if (filters.level) params.append('level', filters.level);
    
    const queryString = params.toString();
    return apiRequest(`/api/offers${queryString ? `?${queryString}` : ''}`);
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    return apiRequest(`/api/offers/${offerId}`);
  },

  // Get offers by lead
  getOffersByLead: async (leadId) => {
    return apiRequest(`/api/offers/lead/${leadId}`);
  },

  // Accept offer (candidate action)
  acceptOffer: async (offerId) => {
    return apiRequest(`/api/offers/${offerId}/accept`, {
      method: 'POST',
    });
  },

  // Reject offer (candidate action)
  rejectOffer: async (offerId) => {
    return apiRequest(`/api/offers/${offerId}/reject`, {
      method: 'POST',
    });
  },

  // Generate and download offer PDF
  downloadOfferPDF: async (offerId) => {
    const endpoint = `/api/offers/${offerId}/pdf`;
    const filename = `offer-${offerId}.pdf`;
    return downloadBlob(endpoint, filename);
  },

  // Update payment status
  updatePaymentStatus: async (offerId, paymentData) => {
    return apiRequest(`/api/offers/${offerId}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },
};

export default offerAPI;

