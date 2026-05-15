import apiClient from '@/lib/axios';

/**
 * Admin-only APIs (JWT must carry role ADMIN).
 */
const adminService = {
  listUsers: () => apiClient.get('/auth/admin/users').then((r) => r.data),

  setUserActive: (userId, active) =>
    apiClient.patch(`/auth/admin/users/${userId}/active`, { active }).then((r) => r.data),

  listAllOrders: () => apiClient.get('/orders/admin/all').then((r) => r.data),

  listAllPayments: () => apiClient.get('/api/payments/admin/all').then((r) => r.data),

  updatePaymentStatus: (paymentId, status) =>
    apiClient.patch(`/api/payments/admin/${paymentId}/status`, { status }).then((r) => r.data),

  sendBroadcast: (subject, message) => 
    apiClient.post('/notifications/broadcast', { subject, message }).then((r) => r.data),
};

export default adminService;
