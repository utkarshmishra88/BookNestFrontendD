import { create } from 'zustand';

/**
 * Zustand cart store — mirrors the cart-service response in client memory
 * for instant UI updates (optimistic) before server confirmation.
 */
export const useCartStore = create((set, get) => ({
  items:     [],  // CartItem[]: { cartItemId, bookId, quantity, price, book? }
  itemCount: 0,
  total:     0,

  /** Replace full cart state from API response */
  setCart: (cart) => {
    const items = cart?.cartItems ?? [];
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
    set({ items, itemCount, total });
  },

  clearCart: () => set({ items: [], itemCount: 0, total: 0 }),

  /** Compute total for display */
  getTotal: () => {
    return get().items.reduce((s, i) => s + i.price * i.quantity, 0);
  },
}));
