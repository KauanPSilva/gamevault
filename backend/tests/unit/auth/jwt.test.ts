import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

import { env } from '../../../src/config/env.js';

import {
  generateToken,
  verifyToken,
} from '../../../src/utils/jwt.js';

describe('JWT utilities', () => {
  const user = {
    id: '88fd7aae-b35f-44da-9349-7d2f2e119834',
    role: 'CUSTOMER' as const,
  };

  const signingOptions = {
    algorithm: 'HS256' as const,
    subject: user.id,
    issuer: 'gamevault-api',
    audience: 'gamevault-client',
    expiresIn: 3600,
  };

  it('should generate a valid JWT', () => {
    const token = generateToken(user);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify a valid token', () => {
    const token = generateToken(user);

    const payload = verifyToken(token);

    expect(payload.sub).toBe(user.id);
    expect(payload.role).toBe('CUSTOMER');
  });

  it('should support administrator tokens', () => {
    const token = generateToken({
      ...user,
      role: 'ADMIN',
    });

    const payload = verifyToken(token);

    expect(payload.role).toBe('ADMIN');
  });

  it('should use the configured expiration time', () => {
    const token = generateToken(user);

    const payload = verifyToken(token);

    expect(payload.exp - payload.iat).toBe(
      env.JWT_EXPIRES_IN_SECONDS
    );
  });

  it('should use the HS256 algorithm', () => {
    const token = generateToken(user);

    const decoded = jwt.decode(token, {
      complete: true,
    });

    expect(decoded?.header.alg).toBe('HS256');
  });

  it('should include the expected issuer and audience', () => {
    const token = generateToken(user);

    const decoded = jwt.decode(token);

    expect(decoded).toMatchObject({
      iss: 'gamevault-api',
      aud: 'gamevault-client',
    });
  });

  it('should reject malformed tokens', () => {
    expect(() => verifyToken('invalid-token'))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject expired tokens', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        ...signingOptions,
        expiresIn: -60,
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens signed with another secret', () => {
    const token = jwt.sign(
      { role: user.role },
      'different-test-secret',
      signingOptions
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tampered payloads', () => {
    const token = generateToken(user);

    const [header, payload, signature] = token.split('.');

    const decodedPayload = JSON.parse(
      Buffer.from(payload!, 'base64url').toString('utf8')
    );

    decodedPayload.role = 'ADMIN';

    const modifiedPayload = Buffer.from(
      JSON.stringify(decodedPayload)
    ).toString('base64url');

    const tamperedToken =
      `${header}.${modifiedPayload}.${signature}`;

    expect(() => verifyToken(tamperedToken))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens with an invalid issuer', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        ...signingOptions,
        issuer: 'untrusted-api',
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens with an invalid audience', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        ...signingOptions,
        audience: 'untrusted-client',
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject unauthorized signing algorithms', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        ...signingOptions,
        algorithm: 'HS384',
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens with an invalid user role', () => {
    const token = jwt.sign(
      { role: 'SUPER_ADMIN' },
      env.JWT_SECRET,
      signingOptions
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens with an invalid user ID', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        ...signingOptions,
        subject: 'invalid-uuid',
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens without expiration', () => {
    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: user.id,
        issuer: 'gamevault-api',
        audience: 'gamevault-client',
      }
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });

  it('should reject tokens without a role', () => {
    const token = jwt.sign(
      {},
      env.JWT_SECRET,
      signingOptions
    );

    expect(() => verifyToken(token))
      .toThrow('Invalid or expired authentication token');
  });
});