import { create } from 'zustand';

/** Tracks wishlist book IDs for quick "is wishlisted?" checks. */
export const useWishlistStore = create((set) => ({
  bookIds: new Set(),

  setWishlist: (items) => {
    const bookIds = new Set(items.map((i) => Number(i.bookId)));
    set({ bookIds });
  },

  addBookId: (id) =>
    set((s) => ({ bookIds: new Set([...s.bookIds, Number(id)]) })),
  removeBookId: (id) =>
    set((s) => {
      const next = new Set(s.bookIds);
      next.delete(Number(id));
      return { bookIds: next };
    }),

  isWishlisted: (id) => (state) => state.bookIds.has(Number(id)),
}));
