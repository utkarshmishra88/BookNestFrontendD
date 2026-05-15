import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from './wishlistStore';

describe('wishlistStore', () => {
  beforeEach(() => {
    useWishlistStore.getState().setWishlist([]);
  });

  it('sets wishlist items correctly', () => {
    useWishlistStore.getState().setWishlist([{ bookId: 10 }, { bookId: 20 }]);
    const state = useWishlistStore.getState();
    expect(state.bookIds.has(10)).toBe(true);
    expect(state.bookIds.has(20)).toBe(true);
    expect(state.bookIds.size).toBe(2);
  });

  it('adds and removes book IDs', () => {
    useWishlistStore.getState().addBookId(50);
    expect(useWishlistStore.getState().bookIds.has(50)).toBe(true);

    useWishlistStore.getState().removeBookId(50);
    expect(useWishlistStore.getState().bookIds.has(50)).toBe(false);
  });

  it('checks if wishlisted', () => {
    useWishlistStore.getState().addBookId(100);
    const check = useWishlistStore.getState().isWishlisted(100);
    expect(check(useWishlistStore.getState())).toBe(true);
  });
});
