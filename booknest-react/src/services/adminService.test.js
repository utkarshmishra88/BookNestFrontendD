import { describe, it, expect, vi } from 'vitest';
import adminService from './adminService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('adminService', () => {
  it('lists users', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await adminService.listUsers();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/admin/users');
  });

  it('sets user active', async () => {
    apiClient.patch.mockResolvedValue({ data: 'ok' });
    await adminService.setUserActive(1, true);
    expect(apiClient.patch).toHaveBeenCalledWith('/auth/admin/users/1/active', { active: true });
  });

  it('sends broadcast', async () => {
    apiClient.post.mockResolvedValue({ data: 'sent' });
    await adminService.sendBroadcast('Sub', 'Msg');
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/broadcast', { subject: 'Sub', message: 'Msg' });
  });
});
