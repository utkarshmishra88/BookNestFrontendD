import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
  });

  it('starts with null auth state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets auth data correctly', () => {
    const user = { userId: 1, fullName: 'Test User' };
    const token = 'fake-token';
    
    useAuthStore.getState().setAuth({ token, user });
    
    const state = useAuthStore.getState();
    expect(state.token).toBe(token);
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('logs out correctly', () => {
    useAuthStore.getState().setAuth({ token: 't', user: {} });
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('updates user data', () => {
    useAuthStore.getState().setAuth({ token: 't', user: { fullName: 'Old' } });
    useAuthStore.getState().updateUser({ fullName: 'New' });
    
    expect(useAuthStore.getState().user.fullName).toBe('New');
  });

  it('initializes auth from localStorage', () => {
    localStorage.setItem('bn_token', 'header.eyJzdWIiOiIxMjMifQ.sig');
    localStorage.setItem('bn_user', JSON.stringify({ userId: '123', fullName: 'Stored' }));
    
    useAuthStore.getState().initAuth();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.fullName).toBe('Stored');
  });
});
