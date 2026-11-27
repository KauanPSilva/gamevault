import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';

import { prisma } from '../../src/config/database.js';
import { authenticate } from '../../src/middlewares/auth.middleware.js';
import { authorize } from '../../src/middlewares/authorize.middleware.js';
import { errorMiddleware } from '../../src/middlewares/error.middleware.js';
import { generateToken } from '../../src/utils/jwt.js';
import { hashPassword } from '../../src/utils/password.js';

describe('Authorization integration', () => {
  const testId = randomUUID();

  const customerId = randomUUID();
  const adminId = randomUUID();

  const testEmails = [
    `rbac-customer-${testId}@example.com`,
    `rbac-admin-${testId}@example.com`,
  ];

  const testApp = express();

  testApp.get(
    '/admin-only',
    authenticate,
    authorize('ADMIN'),
    (_req, res) => {
      res.status(200).json({
        message: 'Admin access granted',
      });
    }
  );

  testApp.get(
    '/shared',
    authenticate,
    authorize('CUSTOMER', 'ADMIN'),
    (_req, res) => {
      res.status(200).json({
        message: 'Access granted',
      });
    }
  );

  testApp.use(errorMiddleware);

  const server = createServer(testApp);

  beforeAll(async () => {
    const passwordHash = await hashPassword('GameVault123');

    await prisma.user.createMany({
      data: [
        {
          id: customerId,
          name: 'RBAC Customer',
          email: testEmails[0]!,
          passwordHash,
          role: 'CUSTOMER',
        },
        {
          id: adminId,
          name: 'RBAC Administrator',
          email: testEmails[1]!,
          passwordHash,
          role: 'ADMIN',
        },
      ],
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);

      server.listen(0, '127.0.0.1', () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [customerId, adminId],
          },
        },
      });
    } finally {
      try {
        await new Promise<void>((resolve, reject) => {
          if (!server.listening) {
            resolve();
            return;
          }

          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  });

  it('should allow administrators to access protected resources', async () => {
    const token = generateToken({
      id: adminId,
      role: 'ADMIN',
    });

    const response = await request(server)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Admin access granted');
  });

  it('should deny customers access to admin resources', async () => {
    const token = generateToken({
      id: customerId,
      role: 'CUSTOMER',
    });

    const response = await request(server)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('should deny unauthenticated access', async () => {
    const response = await request(server)
      .get('/admin-only');

    expect(response.status).toBe(401);

    expect(response.body.error.code)
      .toBe('AUTHENTICATION_REQUIRED');
  });

  it('should allow customers to access shared resources', async () => {
    const token = generateToken({
      id: customerId,
      role: 'CUSTOMER',
    });

    const response = await request(server)
      .get('/shared')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should allow administrators to access shared resources', async () => {
    const token = generateToken({
      id: adminId,
      role: 'ADMIN',
    });

    const response = await request(server)
      .get('/shared')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should use the current database role instead of the JWT role', async () => {
    const token = generateToken({
      id: customerId,
      role: 'ADMIN',
    });

    const response = await request(server)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('should revoke admin access after a role downgrade', async () => {
    const token = generateToken({
      id: adminId,
      role: 'ADMIN',
    });

    const before = await request(server)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(before.status).toBe(200);

    await prisma.user.update({
      where: {
        id: adminId,
      },
      data: {
        role: 'CUSTOMER',
      },
    });

    try {
      const response = await request(server)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    } finally {
      await prisma.user.update({
        where: {
          id: adminId,
        },
        data: {
          role: 'ADMIN',
        },
      });
    }
  });
});