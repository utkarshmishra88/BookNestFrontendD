import { describe, it, expect, vi } from 'vitest';
import walletService from './walletService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('walletService', () => {
  it('fetches wallet', async () => {
    apiClient.get.mockResolvedValue({ data: { balance: 100 } });
    const res = await walletService.getWallet(1);
    expect(apiClient.get).toHaveBeenCalledWith('/wallets/1');
    expect(res.balance).toBe(100);
  });

  it('creates topup order', async () => {
    apiClient.post.mockResolvedValue({ data: { orderId: 'O1' } });
    await walletService.createTopupOrder(1, { amount: 50 });
    expect(apiClient.post).toHaveBeenCalledWith('/wallets/1/topup/create-order', { amount: 50 });
  });

  it('verifies topup', async () => {
    apiClient.post.mockResolvedValue({ data: { status: 'OK' } });
    await walletService.verifyTopup(1, { paymentId: 'P1' });
    expect(apiClient.post).toHaveBeenCalledWith('/wallets/1/topup/verify', { paymentId: 'P1' });
  });

  it('debits wallet', async () => {
    apiClient.post.mockResolvedValue({ data: { status: 'OK' } });
    await walletService.debitWallet(1, { amount: 10 });
    expect(apiClient.post).toHaveBeenCalledWith('/wallets/1/debit', { amount: 10 });
  });
});
