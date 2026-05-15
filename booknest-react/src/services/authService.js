import apiClient from '@/lib/axios';

/**
 * Auth Service — wraps all auth-service REST endpoints.
 * Spring Boot Controller: com.booknest.auth.resource.AuthResource
 * Base path: /auth
 */
const authService = {
  /**
   * Register a new user account.
   * POST /auth/register
   * @param {{ fullName, email, password, role }} data
   */
  register: (data) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  /**
   * Verify email OTP.
   * POST /auth/verify
   * @param {{ email, otp }} data
   */
  verifyOtp: ({ email, otp }) =>
    apiClient.post('/auth/verify', { email, otp }).then((r) => r.data),

  /**
   * Login — returns JWT token + user profile.
   * POST /auth/login
   * @param {{ email, password }} data
   */
  login: (data) =>
    apiClient.post('/auth/login', data).then((r) => r.data),

  /**
   * Logout — invalidates JWT on server (token blacklist).
   * POST /auth/logout
   */
  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),

  /**
   * Fetch user profile by ID.
   * GET /auth/profile/:userId
   */
  getProfile: (userId) =>
    apiClient.get(`/auth/profile/${userId}`).then((r) => r.data),

  /** PUT /auth/profile/:userId — update full name */
  updateProfile: (userId, data) =>
    apiClient.put(`/auth/profile/${userId}`, data).then((r) => r.data),

  /** POST /auth/profile/:userId/email/request — OTP sent to new email */
  requestEmailChange: (userId, newEmail) =>
    apiClient.post(`/auth/profile/${userId}/email/request`, { newEmail }).then((r) => r.data),

  /** POST /auth/profile/:userId/email/confirm — returns new JWT string */
  confirmEmailChange: (userId, body) =>
    apiClient.post(`/auth/profile/${userId}/email/confirm`, body).then((r) => {
      const d = r.data;
      if (typeof d === 'string') return d;
      if (d && typeof d === 'object' && d.token) return d.token;
      return String(d ?? '');
    }),

  /** Forgot Password */
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  /** Reset Password */
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),
};

export default authService;
