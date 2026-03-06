import { API_BASE_URL } from './constant';
import { apiRequest } from './apiClient';

// Validate coupon (public - no auth required for checkout)
export const validateCoupon = async (code, amount = 0) => {
  const res = await fetch(
    `${API_BASE_URL}/api/coupons/validate?code=${encodeURIComponent(code)}&amount=${Number(amount)}`
  );
  const data = await res.json();
  return data;
};

export const validateCouponPost = async (code, amount = 0) => {
  return apiRequest('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, amount }),
  });
};

// List active coupons (optional)
export const getCoupons = async () => {
  return apiRequest('/api/coupons');
};

export default { validateCoupon, validateCouponPost, getCoupons };
