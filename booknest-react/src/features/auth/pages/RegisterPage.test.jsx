import { describe, expect, it } from 'vitest';
import { registerSchema } from '@/features/auth/validation/registerSchema';

describe('registerSchema', () => {
  it('accepts valid registration fields', async () => {
    const payload = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Strong@123',
      confirm: 'Strong@123',
    };

    await expect(registerSchema.validate(payload)).resolves.toBeTruthy();
  });

  it('rejects numbers in full name', async () => {
    const payload = {
      fullName: 'John123',
      email: 'john@example.com',
      password: 'Strong@123',
      confirm: 'Strong@123',
    };

    await expect(registerSchema.validate(payload)).rejects.toThrow(
      'Name cannot contain numbers or invalid characters'
    );
  });

  it('rejects invalid email without @', async () => {
    const payload = {
      fullName: 'John Doe',
      email: 'johnexample.com',
      password: 'Strong@123',
      confirm: 'Strong@123',
    };

    await expect(registerSchema.validate(payload)).rejects.toThrow(
      'Enter a valid email with "@"'
    );
  });

  it('rejects password without special character', async () => {
    const payload = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Strong1234',
      confirm: 'Strong1234',
    };

    await expect(registerSchema.validate(payload)).rejects.toThrow(
      'Password must contain at least one special character'
    );
  });
});
