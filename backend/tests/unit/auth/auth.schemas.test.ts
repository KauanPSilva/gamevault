import { describe, it, expect } from 'vitest';

import {
  registerSchema,
} from '../../../src/modules/auth/schemas/register.schema.js';

import {
  loginSchema,
} from '../../../src/modules/auth/schemas/login.schema.js';

describe('Register schema', () => {
  const validInput = {
    name: 'GameVault Test',
    email: 'customer@example.com',
    password: 'GameVault123',
  };

  it('should accept valid registration data', () => {
    const result = registerSchema.parse(validInput);

    expect(result).toEqual(validInput);
  });

  it('should normalize name and email', () => {
    const result = registerSchema.parse({
      ...validInput,
      name: '  GameVault Test  ',
      email: '  CUSTOMER@EXAMPLE.COM  ',
    });

    expect(result.name).toBe('GameVault Test');
    expect(result.email).toBe('customer@example.com');
  });

  it.each([
    '',
    'A',
    'AB',
    '   ',
    'A'.repeat(101),
  ])('should reject invalid name: %s', (name) => {
    const result = registerSchema.safeParse({
      ...validInput,
      name,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    '',
    'invalid-email',
    'customer@',
    '@example.com',
  ])('should reject invalid email: %s', (email) => {
    const result = registerSchema.safeParse({
      ...validInput,
      email,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    '',
    '123',
    'gamevault123',
    'GAMEVAULT123',
    'GameVault',
    'GameVault123'.repeat(12),
  ])('should reject invalid password: %s', (password) => {
    const result = registerSchema.safeParse({
      ...validInput,
      password,
    });

    expect(result.success).toBe(false);
  });

  it('should reject privilege escalation attempts', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      role: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });

  it('should reject unexpected properties', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });

  it('should preserve password whitespace', () => {
    const password = ' GameVault123 ';

    const result = registerSchema.parse({
      ...validInput,
      password,
    });

    expect(result.password).toBe(password);
  });

  it('should reject missing required fields', () => {
    const result = registerSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('Login schema', () => {
  const validInput = {
    email: 'customer@example.com',
    password: 'GameVault123',
  };

  it('should accept valid login data', () => {
    const result = loginSchema.parse(validInput);

    expect(result).toEqual(validInput);
  });

  it('should normalize email', () => {
    const result = loginSchema.parse({
      ...validInput,
      email: '  CUSTOMER@EXAMPLE.COM  ',
    });

    expect(result.email).toBe('customer@example.com');
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      ...validInput,
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      ...validInput,
      password: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject excessively long passwords', () => {
    const result = loginSchema.safeParse({
      ...validInput,
      password: 'A'.repeat(129),
    });

    expect(result.success).toBe(false);
  });

  it('should not enforce registration password rules', () => {
    const result = loginSchema.safeParse({
      ...validInput,
      password: 'oldpassword',
    });

    expect(result.success).toBe(true);
  });

  it('should preserve password whitespace', () => {
    const password = ' GameVault123 ';

    const result = loginSchema.parse({
      ...validInput,
      password,
    });

    expect(result.password).toBe(password);
  });

  it('should reject unexpected properties', () => {
    const result = loginSchema.safeParse({
      ...validInput,
      role: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const result = loginSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});