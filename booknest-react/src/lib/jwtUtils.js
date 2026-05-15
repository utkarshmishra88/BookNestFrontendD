/**
 * JWT utility functions for token parsing and validation
 */

/**
 * Decode JWT payload without verification
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
export const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    const payload = parts[1];
    // JWT payloads use base64url, not plain base64.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
};

/**
 * Extract user info from JWT payload
 * @param {string} token - JWT token
 * @returns {object} User object with userId, email, fullName, role
 */
export const extractUserFromJWT = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  // JWT payloads may vary by auth-service version.
  // Prefer explicit numeric ID claims, then fall back to subject.
  const rawUserId =
    payload.userId ??
    payload.user_id ??
    payload.id ??
    payload.sub;

  const userId = rawUserId;
  const email = payload.email || (typeof payload.sub === 'string' && payload.sub.includes('@') ? payload.sub : undefined);
  
  return {
    userId: userId,
    email: email,
    fullName: payload.name || payload.fullName || email?.split('@')[0] || 'User',
    role: payload.role ? payload.role.replace('ROLE_', '') : 'CUSTOMER',
  };
};
