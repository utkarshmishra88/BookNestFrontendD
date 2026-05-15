import apiClient from '@/lib/axios';

/**
 * Address Service — manages user addresses.
 * Expected backend base path (via gateway): /auth/addresses
 */
const addressService = {
  /** GET /auth/addresses/user/:userId */
  getUserAddresses: (userId) =>
    apiClient.get(`/auth/addresses/user/${encodeURIComponent(userId)}`).then((r) => r.data),

  /** POST /auth/addresses */
  createAddress: (data) =>
    apiClient.post('/auth/addresses', data).then((r) => r.data),

  /** PUT /auth/addresses/:addressId */
  updateAddress: (addressId, data) =>
    apiClient.put(`/auth/addresses/${encodeURIComponent(addressId)}`, data).then((r) => r.data),
};

export default addressService;
