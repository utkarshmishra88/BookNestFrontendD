import apiClient from '@/lib/axios';

/**
 * Payment Service — wraps payment-service REST endpoints.
 * Handles Razorpay orders for CARD, UPI, NETBANKING payments.
 * Base path: /payments
 */
const paymentService = {
  /**
   * POST /payments/create-order
   * Creates a Razorpay order for payment processing.
   * @param {{ orderId, userId, amount, paymentMode }} body
   */
  createPaymentOrder: (body) =>
    apiClient.post('/payments/create-order', body).then((r) => r.data),

  /**
   * POST /payments/verify
   * Verifies Razorpay payment signature and marks payment as successful.
   * @param {{ paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }} body
   */
  verifyPayment: (body) =>
    apiClient.post('/payments/verify', body).then((r) => r.data),

  /**
   * GET /payments/:paymentId
   * Fetch payment details by ID.
   */
  getPaymentById: (paymentId) =>
    apiClient.get(`/payments/${paymentId}`).then((r) => r.data),
};

export default paymentService;
