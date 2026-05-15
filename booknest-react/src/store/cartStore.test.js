import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts empty', () => {
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().itemCount).toBe(0);
  });

  it('sets cart and calculates totals', () => {
    const cart = {
      cartItems: [
        { cartItemId: 1, quantity: 2, price: 100 },
        { cartItemId: 2, quantity: 1, price: 50 },
      ]
    };
    useCartStore.getState().setCart(cart);

    const state = useCartStore.getState();
    expect(state.itemCount).toBe(3);
    expect(state.total).toBe(250);
  });

  it('clears cart', () => {
    useCartStore.getState().setCart({ cartItems: [{ quantity: 1, price: 10 }] });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('gets total via getter', () => {
    useCartStore.getState().setCart({ cartItems: [{ quantity: 5, price: 10 }] });
    expect(useCartStore.getState().getTotal()).toBe(50);
  });
});
