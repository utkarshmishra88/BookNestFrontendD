import { describe, it, expect, vi } from 'vitest';
import authService from './authService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('authService', () => {
  it('calls login endpoint correctly', async () => {
    const data = { email: 't@e.com', password: 'p' };
    apiClient.post.mockResolvedValue({ data: { token: 'tok' } });

    const result = await authService.login(data);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', data);
    expect(result.token).toBe('tok');
  });

  it('calls register endpoint correctly', async () => {
    const data = { fullName: 'Name' };
    apiClient.post.mockResolvedValue({ data: 'success' });

    const result = await authService.register(data);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', data);
    expect(result).toBe('success');
  });

  it('handles confirmEmailChange different response formats', async () => {
    // String response
    apiClient.post.mockResolvedValueOnce({ data: 'str-token' });
    let res = await authService.confirmEmailChange(1, {});
    expect(res).toBe('str-token');

    // Object response
    apiClient.post.mockResolvedValueOnce({ data: { token: 'obj-token' } });
    res = await authService.confirmEmailChange(1, {});
    expect(res).toBe('obj-token');

    // Empty response
    apiClient.post.mockResolvedValueOnce({ data: null });
    res = await authService.confirmEmailChange(1, {});
    expect(res).toBe('');
  });
});
