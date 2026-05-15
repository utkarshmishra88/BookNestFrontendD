import apiClient from '@/lib/axios';

/**
 * Cart Service — wraps cart-service REST endpoints.
 * Spring Boot: com.booknest.cart.resource.CartResource
 * Base path: /carts
 */
const cartService = {
  /** GET /carts/:userId */
  getCart: (userId) =>
    apiClient.get(`/carts/${encodeURIComponent(userId)}`).then((r) => r.data),

  /**
   * POST /carts/:userId/add
   * @param {number} userId
   * @param {{ bookId, quantity }} item
   */
  addToCart: (userId, item) =>
    apiClient.post(`/carts/${encodeURIComponent(userId)}/add`, item).then((r) => r.data),

  /** DELETE /carts/:userId/remove/:bookId */
  removeFromCart: (userId, bookId) =>
    apiClient.delete(`/carts/${encodeURIComponent(userId)}/remove/${bookId}`).then((r) => r.data),

  /** DELETE /carts/:userId/clear */
  clearCart: (userId) =>
    apiClient.delete(`/carts/${encodeURIComponent(userId)}/clear`).then((r) => r.data),
};

export default cartService;
