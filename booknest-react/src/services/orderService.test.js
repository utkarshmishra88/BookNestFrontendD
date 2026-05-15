import { describe, it, expect, vi } from 'vitest';
import orderService from './orderService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('orderService', () => {
  it('normalizes order with totalAmount and items', () => {
    const raw = {
      totalAmount: '100.5',
      items: [{ quantity: '2', price: '50.25' }]
    };
    const norm = orderService.normalizeOrder(raw);
    expect(norm.totalAmount).toBe(100.5);
    expect(norm.orderItems[0].quantity).toBe(2);
    expect(norm.orderItems[0].price).toBe(50.25);
  });

  it('unwraps list response correctly', () => {
    const payload = { data: [{ orderId: 1 }] };
    const result = orderService.unwrapListResponse(payload);
    expect(result).toHaveLength(1);
    expect(result[0].totalAmount).toBe(0);
  });

  it('calls placeOrder endpoint', async () => {
    apiClient.post.mockResolvedValue({ data: { orderId: 123 } });
    const res = await orderService.placeOrder(1, { mode: 'COD' });
    expect(apiClient.post).toHaveBeenCalledWith('/orders/place/1', { mode: 'COD' });
    expect(res.orderId).toBe(123);
  });

  it('calls updateOrderStatus with query param', async () => {
    apiClient.put.mockResolvedValue({ data: { orderId: 1 } });
    await orderService.updateOrderStatus(1, 'SHIPPED');
    expect(apiClient.put).toHaveBeenCalledWith('/orders/admin/1/status?status=SHIPPED');
  });

  it('validates coupon with query params', async () => {
    apiClient.get.mockResolvedValue({ data: { valid: true } });
    await orderService.validateCoupon('SAVE10', 100);
    expect(apiClient.get).toHaveBeenCalledWith('/coupons/validate?code=SAVE10&orderAmount=100');
  });
});
