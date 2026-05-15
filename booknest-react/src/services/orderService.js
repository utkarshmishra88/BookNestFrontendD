import apiClient from '@/lib/axios';

/**
 * Order Service — wraps order-service REST endpoints.
 * Spring Boot: com.booknest.order.resource.OrderResource
 * Base path: /orders
 *
 * Payment modes: 
 * - COD: Direct order creation, no payment processing
 * - WALLET: Order created, wallet debited by order-service
 * - CARD, UPI, NETBANKING: Payment processed via payment-service
 */
const orderService = {
  normalizeOrder: (order = {}) => ({
    ...order,
    totalAmount: Number(order.totalAmount ?? 0),
    orderItems: (order.orderItems || order.items || []).map((item) => ({
      ...item,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
    })),
  }),

  unwrapListResponse: (payload) => {
    const list = Array.isArray(payload) ? payload : payload?.data || payload?.orders || [];
    return list.map((order) => orderService.normalizeOrder(order));
  },

  unwrapSingleResponse: (payload) => {
    const order = payload?.data || payload?.order || payload;
    return orderService.normalizeOrder(order);
  },

  /**
   * POST /orders/place/:userId
   * Creates order and initiates payment based on paymentMode.
   * 
   * @param {number} userId
   * @param {object} body - { paymentMode: 'COD'|'WALLET'|'CARD'|'UPI'|'NETBANKING', shippingAddressId?: number }
   * 
   * Response:
   * - COD: { orderId, orderStatus: 'CONFIRMED', message }
   * - WALLET: { orderId, orderStatus: 'CONFIRMED', message } (if sufficient balance)
   * - CARD/UPI: { orderId, paymentId, razorpayOrderId, razorpayKeyId, status: 'PENDING_PAYMENT' }
   */
  placeOrder: (userId, body) =>
    apiClient.post(`/orders/place/${userId}`, body).then((r) => r.data),

  /**
   * POST /orders/verify/:userId
   * Verifies payment signature and confirms order after successful Razorpay payment.
   * 
   * @param {number} userId
   * @param {object} body - { orderId, paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
   * 
   * Response: { orderId, orderStatus: 'CONFIRMED'|'FAILED', message }
   */
  verifyPayment: (userId, body) =>
    apiClient.post(`/orders/verify/${userId}`, body).then((r) => r.data),

  /**
   * GET /orders/:userId
   * Fetch all orders for a user with order items.
   */
  getOrders: (userId) =>
    apiClient.get(`/orders/${userId}`).then((r) => orderService.unwrapListResponse(r.data)),

  /**
   * GET /orders/:userId/:orderId
   * Fetch a specific order by ID with full details and items.
   */
  getOrderById: (userId, orderId) =>
    apiClient.get(`/orders/${userId}/${orderId}`).then((r) => orderService.unwrapSingleResponse(r.data)),

  /** GET /orders/admin/all — ADMIN only */
  getAdminOrders: () =>
    apiClient.get('/orders/admin/all').then((r) => orderService.unwrapListResponse(r.data)),

  /** PUT /orders/admin/:orderId/status — ADMIN only */
  updateOrderStatus: (orderId, status) =>
    apiClient.put(`/orders/admin/${orderId}/status?status=${status}`).then((r) => orderService.unwrapSingleResponse(r.data)),

  /** Download Receipt PDF */
  downloadReceipt: (userId, orderId) =>
    apiClient.get(`/orders/${userId}/${orderId}/receipt`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }),

  /** Download Invoice PDF */
  downloadInvoice: (userId, orderId) =>
    apiClient.get(`/orders/${userId}/${orderId}/invoice`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }),

  // Coupon Management
  getCoupons: () => apiClient.get('/coupons').then(r => r.data),
  createCoupon: (data) => apiClient.post('/coupons', data).then(r => r.data),
  deleteCoupon: (id) => apiClient.delete(`/coupons/${id}`).then(r => r.data),
  validateCoupon: (code, amount) => 
    apiClient.get(`/coupons/validate?code=${code}&orderAmount=${amount}`).then(r => r.data),
};

export default orderService;
