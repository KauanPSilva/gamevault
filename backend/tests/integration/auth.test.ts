import { randomUUID } from 'node:crypto';
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';

import app from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { verifyPassword } from '../../src/utils/password.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('Authentication integration', () => {
  const testId = randomUUID();

  const credentials = {
    name: 'Integration Test User',
    email: `test-${testId}@example.com`,
    password: 'GameVault123',
  };

  const unauthorizedEmail =
    `admin-${testId}@example.com`;

  const testEmails = [
    credentials.email,
    unauthorizedEmail,
  ];

  async function getAccessToken(): Promise<string> {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password,
      });

    expect(response.status).toBe(200);

    return response.body.accessToken;
  }

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: testEmails,
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(credentials);

      expect(response.status).toBe(201);

      expect(response.body.user).toMatchObject({
        name: credentials.name,
        email: credentials.email,
        role: 'CUSTOMER',
      });

      expect(response.body.user.id).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.tokenType).toBe('Bearer');

      expect(response.body.user)
        .not.toHaveProperty('passwordHash');

      expect(response.body.user)
        .not.toHaveProperty('password');

      expect(response.headers['cache-control'])
        .toBe('no-store');
    });

    it('should persist the user with a hashed password', async () => {
      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email,
        },
      });

      expect(user).not.toBeNull();

      expect(user?.passwordHash)
        .not.toBe(credentials.password);

      expect(user?.passwordHash)
        .toMatch(/^\$argon2id\$/);

      expect(
        await verifyPassword(
          credentials.password,
          user!.passwordHash
        )
      ).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(credentials);

      expect(response.status).toBe(409);

      expect(response.body.error.code)
        .toBe('EMAIL_ALREADY_REGISTERED');
    });

    it('should reject privilege escalation attempts', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...credentials,
          email: unauthorizedEmail,
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code)
        .toBe('VALIDATION_ERROR');

      const user = await prisma.user.findUnique({
        where: {
          email: unauthorizedEmail,
        },
      });

      expect(user).toBeNull();
    });

    it('should reject invalid registration data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code)
        .toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        });

      expect(response.status).toBe(200);

      expect(response.body.user).toMatchObject({
        email: credentials.email,
        role: 'CUSTOMER',
      });

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.tokenType).toBe('Bearer');

      expect(response.body.user)
        .not.toHaveProperty('passwordHash');

      expect(response.headers['cache-control'])
        .toBe('no-store');
    });

    it('should reject incorrect passwords', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: credentials.email,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);

      expect(response.body.error.code)
        .toBe('INVALID_CREDENTIALS');
    });

    it('should reject unknown users', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: `unknown-${testId}@example.com`,
          password: credentials.password,
        });

      expect(response.status).toBe(401);

      expect(response.body.error).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('should normalize email before authentication', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: ` ${credentials.email.toUpperCase()} `,
          password: credentials.password,
        });

      expect(response.status).toBe(200);

      expect(response.body.user.email)
        .toBe(credentials.email);
    });

    it('should reject invalid login data', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code)
        .toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /auth/me', () => {
    it('should return the authenticated user profile', async () => {
      const accessToken = await getAccessToken();

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.user).toMatchObject({
        name: credentials.name,
        email: credentials.email,
        role: 'CUSTOMER',
      });

      expect(response.body.user)
        .not.toHaveProperty('passwordHash');

      expect(response.body)
        .not.toHaveProperty('accessToken');

      expect(response.headers['cache-control'])
        .toBe('no-store');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);

      expect(response.body.error.code)
        .toBe('AUTHENTICATION_REQUIRED');
    });

    it('should reject malformed authorization headers', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Basic invalid-token');

      expect(response.status).toBe(401);

      expect(response.body.error.code)
        .toBe('INVALID_AUTHORIZATION_HEADER');
    });

    it('should reject invalid JWTs', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);

      expect(response.body.error.code)
        .toBe('INVALID_TOKEN');
    });

    it('should reject valid tokens belonging to nonexistent users', async () => {
      const token = generateToken({
        id: randomUUID(),
        role: 'CUSTOMER',
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);

      expect(response.body.error.code)
        .toBe('INVALID_TOKEN');
    });
  });
});