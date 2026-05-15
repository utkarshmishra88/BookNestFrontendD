import { create } from 'zustand';
import { extractUserFromJWT } from '@/lib/jwtUtils';

/**
 * Zustand auth store — single source of truth for authentication state.
 * Persists token + user to localStorage for page-refresh survival.
 *
 * Token is a JWT issued by auth-service; it carries userId, email, role.
 */
export const useAuthStore = create((set, get) => ({
  // ── State ─────────────────────────────────────
  user:          null,     // { userId, fullName, email, role, createdAt }
  token:         null,     // JWT string
  isAuthenticated: false,
  isLoading:     false,

  // ── Actions ───────────────────────────────────

  /**
   * Restore auth state from localStorage on app boot.
   * Called once in App.jsx useEffect.
   */
  initAuth: () => {
    try {
      const token = localStorage.getItem('bn_token');
      const user  = JSON.parse(localStorage.getItem('bn_user') || 'null');
      if (token && user) {
        const normalizedUser = { ...user };
        const tokenUser = extractUserFromJWT(token);

        if (tokenUser) {
          if (normalizedUser.userId == null || String(normalizedUser.userId).includes('@')) {
            normalizedUser.userId = tokenUser.userId ?? normalizedUser.userId;
          }
          if (!normalizedUser.email) normalizedUser.email = tokenUser.email;
          if (!normalizedUser.fullName) normalizedUser.fullName = tokenUser.fullName;
          if (!normalizedUser.role) normalizedUser.role = tokenUser.role;
        }

        set({ token, user: normalizedUser, isAuthenticated: true });
      }
    } catch {
      // Corrupt storage — clear it
      localStorage.removeItem('bn_token');
      localStorage.removeItem('bn_user');
    }
  },

  /**
   * Persist credentials returned from auth-service /login endpoint.
   * @param {{ token: string, user: object }} payload
   */
  setAuth: ({ token, user }) => {
    localStorage.setItem('bn_token', token);
    localStorage.setItem('bn_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  /** Clear auth state and localStorage (called on /logout or 401). */
  logout: () => {
    localStorage.removeItem('bn_token');
    localStorage.removeItem('bn_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  /** Update user profile fields in-place (e.g., after profile edit). */
  updateUser: (fields) => {
    const updated = { ...get().user, ...fields };
    localStorage.setItem('bn_user', JSON.stringify(updated));
    set({ user: updated });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
