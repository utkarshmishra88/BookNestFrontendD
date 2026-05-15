import { describe, it, expect, vi } from 'vitest';
import addressService from './addressService';
import cartService from './cartService';
import paymentService from './paymentService';
import reviewService from './reviewService';
import wishlistService from './wishlistService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('Other Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addressService calls endpoints', async () => {
    await addressService.getUserAddresses(1);
    expect(apiClient.get).toHaveBeenCalledWith('/auth/addresses/user/1');
  });

  it('cartService calls endpoints', async () => {
    await cartService.getCart(1);
    expect(apiClient.get).toHaveBeenCalledWith('/carts/1');
  });

  it('paymentService calls endpoints', async () => {
    await paymentService.createPaymentOrder({});
    expect(apiClient.post).toHaveBeenCalledWith('/payments/create-order', {});
  });

  it('reviewService calls endpoints', async () => {
    await reviewService.getBookReviews(1);
    expect(apiClient.get).toHaveBeenCalledWith('/reviews/book/1');
  });

  it('wishlistService calls endpoints', async () => {
    await wishlistService.getWishlist(1);
    expect(apiClient.get).toHaveBeenCalledWith('/wishlists/1');

    await wishlistService.addToWishlist(1, 10);
    expect(apiClient.post).toHaveBeenCalledWith('/wishlists/1/add/10');

    await wishlistService.removeFromWishlist(1, 10);
    expect(apiClient.delete).toHaveBeenCalledWith('/wishlists/1/remove/10');
  });
});
