import { describe, it, expect, vi } from 'vitest';
import { decodeJWT, extractUserFromJWT } from './jwtUtils';

describe('jwtUtils', () => {
  describe('decodeJWT', () => {
    it('returns null if token is empty', () => {
      expect(decodeJWT('')).toBeNull();
      expect(decodeJWT(null)).toBeNull();
    });

    it('returns null if token format is invalid', () => {
      expect(decodeJWT('invalid-token')).toBeNull();
      expect(decodeJWT('one.two')).toBeNull();
    });

    it('decodes a valid JWT payload', () => {
      // payload: {"sub":"123","name":"John Doe","role":"ROLE_ADMIN"}
      // base64: eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiUk9MRV9BRE1JTiJ9
      const token = 'header.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const decoded = decodeJWT(token);
      expect(decoded).toEqual({
        sub: '123',
        name: 'John Doe',
        role: 'ROLE_ADMIN'
      });
    });

    it('handles base64url characters', () => {
      // payload: {"data":"-._"} -> base64url: eyJkYXRhIjoiLS5fIn0
      const token = 'header.eyJkYXRhIjoiLS5fIn0.signature';
      const decoded = decodeJWT(token);
      expect(decoded.data).toBe('-._');
    });
  });

  describe('extractUserFromJWT', () => {
    it('returns null if token is invalid', () => {
      expect(extractUserFromJWT('bad')).toBeNull();
    });

    it('extracts user info with ROLE_ prefix', () => {
      const token = 'header.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const user = extractUserFromJWT(token);
      expect(user).toEqual({
        userId: '123',
        email: undefined,
        fullName: 'John Doe',
        role: 'ADMIN'
      });
    });

    it('extracts email from sub if it contains @', () => {
      const token = 'header.eyJzdWIiOiJ0ZXN0QGV4LmNvbSJ9.signature';
      const user = extractUserFromJWT(token);
      expect(user.email).toBe('test@ex.com');
    });

    it('uses userId claim if present', () => {
      const token = 'header.eyJ1c2VySWQiOjk5OSwic3ViIjoiMTIzIn0.signature';
      const user = extractUserFromJWT(token);
      expect(user.userId).toBe(999);
    });
  });
});
