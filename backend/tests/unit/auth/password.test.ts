import { describe, it, expect } from 'vitest';

import {
  hashPassword,
  verifyPassword,
} from '../../../src/utils/password.js';

describe('Password utilities', () => {
  const password = 'GameVault123';

  it('should generate a password hash', async () => {
    const hash = await hashPassword(password);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe(password);
  });

  it('should use the Argon2id algorithm', async () => {
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('should use the configured security parameters', async () => {
    const hash = await hashPassword(password);

    expect(hash).toContain('m=19456,t=2,p=1');
  });

  it('should generate different hashes for the same password', async () => {
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    expect(firstHash).not.toBe(secondHash);
  });

  it('should verify a correct password', async () => {
    const hash = await hashPassword(password);

    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword(password);

    const result = await verifyPassword(
      'WrongPassword123',
      hash
    );

    expect(result).toBe(false);
  });

  it('should perform case-sensitive verification', async () => {
    const hash = await hashPassword(password);

    const result = await verifyPassword(
      password.toLowerCase(),
      hash
    );

    expect(result).toBe(false);
  });

  it('should preserve password whitespace', async () => {
    const passwordWithSpaces = ' GameVault123 ';

    const hash = await hashPassword(passwordWithSpaces);

    expect(
      await verifyPassword(passwordWithSpaces, hash)
    ).toBe(true);

    expect(
      await verifyPassword(passwordWithSpaces.trim(), hash)
    ).toBe(false);
  });

  it('should support long passwords', async () => {
    const longPassword = 'A'.repeat(126) + 'a1';

    const hash = await hashPassword(longPassword);

    expect(
      await verifyPassword(longPassword, hash)
    ).toBe(true);
  });

  it('should support Unicode passwords', async () => {
    const unicodePassword = 'GameVault123@çã漢字';

    const hash = await hashPassword(unicodePassword);

    expect(
      await verifyPassword(unicodePassword, hash)
    ).toBe(true);
  });
});