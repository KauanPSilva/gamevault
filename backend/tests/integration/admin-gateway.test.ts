import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import { randomUUID } from 'node:crypto';
import request from 'supertest';

import app from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('Admin payment gateway API', () => {
  const runId = randomUUID();

  const adminId = randomUUID();
  const customerId = randomUUID();
  const unsupportedGatewayId = randomUUID();

  let adminToken: string;
  let customerToken: string;

  let gatewayId: string;
  let originalGatewayStatus: boolean;

  const basePath = '/admin/payment-gateways';

  beforeAll(async () => {
    const gateway =
      await prisma.paymentGateway.findUniqueOrThrow({
        where: {
          code: 'juntos-se-faz',
        },
      });

    gatewayId = gateway.id;
    originalGatewayStatus = gateway.isActive;

    const admin = await prisma.user.create({
      data: {
        id: adminId,
        name: 'Integration Test Admin',
        email: `admin-${runId}@gamevault.test`,
        passwordHash: 'integration-test-only',
        role: 'ADMIN',
      },
    });

    const customer = await prisma.user.create({
      data: {
        id: customerId,
        name: 'Integration Test Customer',
        email: `customer-${runId}@gamevault.test`,
        passwordHash: 'integration-test-only',
        role: 'CUSTOMER',
      },
    });

    adminToken = generateToken(admin);
    customerToken = generateToken(customer);

    await prisma.paymentGateway.create({
      data: {
        id: unsupportedGatewayId,
        name: 'Unsupported Test Gateway',
        code: `unsupported-${runId}`,
        description: 'Integration test fixture',
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    try {
      if (gatewayId) {
        await prisma.paymentGateway.update({
          where: {
            id: gatewayId,
          },
          data: {
            isActive: originalGatewayStatus,
          },
        });
      }

      await prisma.paymentGateway.deleteMany({
        where: {
          id: unsupportedGatewayId,
        },
      });

      await prisma.user.deleteMany({
        where: {
          id: {
            in: [adminId, customerId],
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('Authentication and authorization', () => {
    it('should reject unauthenticated listing', async () => {
      const response = await request(app)
        .get(basePath);

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated updates', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .send({
          isActive: false,
        });

      expect(response.status).toBe(401);
    });

    it('should reject invalid authentication tokens', async () => {
      const response = await request(app)
        .get(basePath)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should prevent customers from listing admin gateways', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${customerToken}`,
        );

      expect(response.status).toBe(403);
    });

    it('should prevent customers from changing gateway status', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${customerToken}`,
        )
        .send({
          isActive: !originalGatewayStatus,
        });

      expect(response.status).toBe(403);

      const gateway =
        await prisma.paymentGateway.findUniqueOrThrow({
          where: {
            id: gatewayId,
          },
        });

      expect(gateway.isActive).toBe(
        originalGatewayStatus,
      );
    });
  });

  describe('Gateway listing', () => {
    it('should allow administrators to list gateways', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.gateways))
        .toBe(true);
    });

    it('should identify implemented integrations', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        );

      expect(response.status).toBe(200);

      expect(response.body.gateways).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: gatewayId,
            code: 'juntos-se-faz',
            isImplemented: true,
            environment: 'sandbox',
          }),
        ]),
      );
    });

    it('should identify unsupported integrations', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        );

      expect(response.status).toBe(200);

      expect(response.body.gateways).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: unsupportedGatewayId,
            isImplemented: false,
            isActive: false,
          }),
        ]),
      );
    });

    it('should not expose gateway credentials', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        );

      expect(response.status).toBe(200);

      for (const gateway of response.body.gateways) {
        expect(Object.keys(gateway).sort()).toEqual(
          [
            'id',
            'name',
            'code',
            'description',
            'isActive',
            'isImplemented',
            'environment',
            'createdAt',
            'updatedAt',
          ].sort(),
        );
      }
    });

    it('should prevent caching administrative responses', async () => {
      const response = await request(app)
        .get(basePath)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        );

      expect(response.status).toBe(200);

      expect(response.headers['cache-control'])
        .toContain('no-store');
    });
  });

  describe('Gateway status management', () => {
    it('should reject invalid gateway IDs', async () => {
      const response = await request(app)
        .patch(`${basePath}/invalid-id`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: false,
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'VALIDATION_ERROR',
      );
    });

    it('should reject invalid status values', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: 'false',
        });

      expect(response.status).toBe(400);
    });

    it('should reject unauthorized fields', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
          code: 'modified-code',
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for nonexistent gateways', async () => {
      const response = await request(app)
        .patch(`${basePath}/${randomUUID()}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
        });

      expect(response.status).toBe(404);

      expect(response.body.error.code).toBe(
        'GATEWAY_NOT_FOUND',
      );
    });

    it('should prevent activation of unsupported gateways', async () => {
      const response = await request(app)
        .patch(`${basePath}/${unsupportedGatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'GATEWAY_NOT_IMPLEMENTED',
      );

      const gateway =
        await prisma.paymentGateway.findUniqueOrThrow({
          where: {
            id: unsupportedGatewayId,
          },
        });

      expect(gateway.isActive).toBe(false);
    });

    it('should deactivate a gateway and remove it from checkout', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.gateway.isActive)
        .toBe(false);

      const gateway =
        await prisma.paymentGateway.findUniqueOrThrow({
          where: {
            id: gatewayId,
          },
        });

      expect(gateway.isActive).toBe(false);

      const checkoutResponse = await request(app)
        .get('/payment-gateways')
        .set(
          'Authorization',
          `Bearer ${customerToken}`,
        );

      expect(checkoutResponse.status).toBe(200);

      expect(checkoutResponse.body.gateways)
        .not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: 'juntos-se-faz',
            }),
          ]),
        );
    });

    it('should activate a gateway and restore checkout availability', async () => {
      const response = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.gateway.isActive)
        .toBe(true);

      const gateway =
        await prisma.paymentGateway.findUniqueOrThrow({
          where: {
            id: gatewayId,
          },
        });

      expect(gateway.isActive).toBe(true);

      const checkoutResponse = await request(app)
        .get('/payment-gateways')
        .set(
          'Authorization',
          `Bearer ${customerToken}`,
        );

      expect(checkoutResponse.status).toBe(200);

      expect(checkoutResponse.body.gateways)
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: 'juntos-se-faz',
            }),
          ]),
        );
    });

    it('should handle repeated status updates idempotently', async () => {
      const firstResponse = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
        });

      const secondResponse = await request(app)
        .patch(`${basePath}/${gatewayId}`)
        .set(
          'Authorization',
          `Bearer ${adminToken}`,
        )
        .send({
          isActive: true,
        });

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);

      expect(secondResponse.body.gateway).toEqual(
        firstResponse.body.gateway,
      );
    });
  });
});