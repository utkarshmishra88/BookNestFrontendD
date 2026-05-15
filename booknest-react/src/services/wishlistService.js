import apiClient from '@/lib/axios';
import bookService from './bookService';

/**
 * Backend returns a JSON array of WishlistItem rows — not { wishlistItems: [...] }.
 */
export function normalizeWishlistItems(data) {
  if (Array.isArray(data)) return data;
  return data?.wishlistItems ?? [];
}

/**
 * Wishlist Service — wraps wishlist-service REST endpoints.
 * Spring Boot: com.booknest.wishlist.resource.WishlistResource
 * Base path: /wishlists
 */
const wishlistService = {
  /** GET /wishlists/:userId — raw array from API */
  getWishlist: (userId) =>
    apiClient.get(`/wishlists/${encodeURIComponent(userId)}`).then((r) => r.data),

  /**
   * Wishlist rows only include bookId; fetches book details for the UI.
   */
  getWishlistWithBooks: async (userId) => {
    const raw = await apiClient.get(`/wishlists/${encodeURIComponent(userId)}`).then((r) => r.data);
    const items = normalizeWishlistItems(raw);
    const wishlistItems = await Promise.all(
      items.map(async (item) => {
        try {
          const book = await bookService.getBook(item.bookId);
          return { ...item, book };
        } catch {
          return { ...item, book: null };
        }
      })
    );
    return { wishlistItems };
  },

  /** POST /wishlists/:userId/add/:bookId */
  addToWishlist: (userId, bookId) =>
    apiClient.post(`/wishlists/${encodeURIComponent(userId)}/add/${bookId}`).then((r) => r.data),

  /** DELETE /wishlists/:userId/remove/:bookId */
  removeFromWishlist: (userId, bookId) =>
    apiClient.delete(`/wishlists/${encodeURIComponent(userId)}/remove/${bookId}`).then((r) => r.data),

  /** POST /wishlists/:userId/move-to-cart/:bookId */
  moveToCart: (userId, bookId) =>
    apiClient.post(`/wishlists/${encodeURIComponent(userId)}/move-to-cart/${bookId}`).then((r) => r.data),
};

export default wishlistService;
