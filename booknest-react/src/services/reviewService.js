import apiClient from '@/lib/axios';

/**
 * Review Service — wraps review-service REST endpoints.
 * Spring Boot: com.booknest.review.resource.ReviewResource
 * Base path: /reviews
 */
const reviewService = {
  /** GET /reviews/book/:bookId */
  getBookReviews: (bookId) =>
    apiClient.get(`/reviews/book/${bookId}`).then((r) => r.data),

  /**
   * POST /reviews/:userId/add
   * @param {number} userId
   * @param {{ bookId, rating, comment }} body
   */
  addReview: (userId, body) =>
    apiClient.post(`/reviews/${userId}/add`, body).then((r) => r.data),

  /** DELETE /reviews/:reviewId */
  deleteReview: (reviewId) =>
    apiClient.delete(`/reviews/${reviewId}`).then((r) => r.data),
};

export default reviewService;
