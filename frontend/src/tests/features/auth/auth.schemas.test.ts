import { describe, it, expect } from 'vitest';

import {
  loginSchema,
  registerSchema,
} from '../../../features/auth/auth.schemas';

const validRegistration = {
  name: 'GameVault Player',
  email: 'player@example.com',
  password: 'GameVault123',
  confirmPassword: 'GameVault123',
};

describe('loginSchema', () => {
  it('should accept valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'player@example.com',
      password: 'GameVault123',
    });

    expect(result.success).toBe(true);
  });

  it('should normalize the email', () => {
    const result = loginSchema.parse({
      email: '  PLAYER@EXAMPLE.COM  ',
      password: 'GameVault123',
    });

    expect(result.email).toBe('player@example.com');
  });

  it('should reject an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'GameVault123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'player@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });

  it('should preserve password whitespace', () => {
    const result = loginSchema.parse({
      email: 'player@example.com',
      password: ' GameVault123 ',
    });

    expect(result.password).toBe(' GameVault123 ');
  });

  it('should reject unexpected fields', () => {
    const result = loginSchema.safeParse({
      email: 'player@example.com',
      password: 'GameVault123',
      role: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should accept valid registration data', () => {
    expect(
      registerSchema.safeParse(validRegistration).success,
    ).toBe(true);
  });

  it('should normalize the name and email', () => {
    const result = registerSchema.parse({
      ...validRegistration,
      name: '  GameVault Player  ',
      email: '  PLAYER@EXAMPLE.COM  ',
    });

    expect(result.name).toBe('GameVault Player');
    expect(result.email).toBe('player@example.com');
  });

  it('should reject a short name', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      name: 'AB',
    });

    expect(result.success).toBe(false);
  });

  it('should reject an invalid email', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
  });

  it.each([
    'Abc123',
    'gamevault123',
    'GAMEVAULT123',
    'GameVault',
    'A1a'.repeat(43),
  ])('should reject invalid password: %s', (password) => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password,
      confirmPassword: password,
    });

    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'DifferentPassword123',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['confirmPassword'],
          }),
        ]),
      );
    }
  });

  it('should reject attempts to assign an admin role', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      role: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });
});