import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'vitest';

import { randomUUID } from 'node:crypto';

import request from 'supertest';

import app from '../../src/app.js';

import { prisma } from '../../src/config/database.js';

import { generateToken } from '../../src/utils/jwt.js';

describe('Orders API', () => {
  const testId = randomUUID();

  let userId: string;
  let secondUserId: string;

  let token: string;
  let secondToken: string;

  let categoryId: string;
  let gameId: string;
  let secondGameId: string;
  let inactiveGameId: string;

  let orderId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Orders Test User',
        email: `orders-${testId}@example.com`,
        passwordHash: 'test-password-hash',
        role: 'CUSTOMER',
      },
    });

    const secondUser = await prisma.user.create({
      data: {
        name: 'Second Orders Test User',
        email: `orders-second-${testId}@example.com`,
        passwordHash: 'test-password-hash',
        role: 'CUSTOMER',
      },
    });

    userId = user.id;
    secondUserId = secondUser.id;

    token = generateToken(user);
    secondToken = generateToken(secondUser);

    const category = await prisma.category.create({
      data: {
        name: `Orders Test ${testId}`,
        slug: `orders-test-${testId}`,
      },
    });

    categoryId = category.id;

    const game = await prisma.game.create({
      data: {
        title: 'Orders Test Game',
        slug: `orders-game-${testId}`,
        description: 'Game used for integration tests',
        price: 10000,
        imageUrl: '/images/test.webp',
        categoryId,
        isActive: true,
      },
    });

    const secondGame = await prisma.game.create({
      data: {
        title: 'Second Orders Test Game',
        slug: `orders-second-game-${testId}`,
        description: 'Second integration test game',
        price: 5000,
        imageUrl: '/images/test.webp',
        categoryId,
        isActive: true,
      },
    });

    const inactiveGame = await prisma.game.create({
      data: {
        title: 'Inactive Orders Test Game',
        slug: `orders-inactive-game-${testId}`,
        description: 'Inactive integration test game',
        price: 2000,
        imageUrl: '/images/test.webp',
        categoryId,
        isActive: false,
      },
    });

    gameId = game.id;
    secondGameId = secondGame.id;
    inactiveGameId = inactiveGame.id;
  });

  afterAll(async () => {
    const userIds = [
      userId,
      secondUserId,
    ].filter(Boolean);

    await prisma.$transaction([
      prisma.libraryItem.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),

      prisma.payment.deleteMany({
        where: {
          order: {
            userId: {
              in: userIds,
            },
          },
        },
      }),

      prisma.orderItem.deleteMany({
        where: {
          order: {
            userId: {
              in: userIds,
            },
          },
        },
      }),

      prisma.order.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),

      prisma.game.deleteMany({
        where: {
          id: {
            in: [
              gameId,
              secondGameId,
              inactiveGameId,
            ].filter(Boolean),
          },
        },
      }),

      prisma.category.deleteMany({
        where: {
          id: {
            in: [categoryId].filter(Boolean),
          },
        },
      }),

      prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      }),
    ]);

    await prisma.$disconnect();
  });

  describe('POST /orders', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          gameIds: [gameId],
        });

      expect(response.status).toBe(401);
    });

    it('should create an order with database prices', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId, secondGameId],
        });

      expect(response.status).toBe(201);

      expect(response.body.order).toMatchObject({
        status: 'PENDING',
        totalAmount: 15000,
        currency: 'BRL',
      });

      expect(response.body.order.items).toHaveLength(2);

      expect(response.body.order.payments).toEqual([]);

      expect(response.headers['cache-control']).toBe(
        'no-store',
      );

      orderId = response.body.order.id;
    });

    it('should persist the order and its items', async () => {
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          items: true,
        },
      });

      expect(order).not.toBeNull();

      expect(order?.userId).toBe(userId);
      expect(order?.totalAmount).toBe(15000);
      expect(order?.status).toBe('PENDING');
      expect(order?.items).toHaveLength(2);

      expect(order?.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            gameId,
            unitPrice: 10000,
          }),

          expect.objectContaining({
            gameId: secondGameId,
            unitPrice: 5000,
          }),
        ]),
      );
    });

    it('should reject an empty cart', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [],
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'VALIDATION_ERROR',
      );
    });

    it('should reject duplicate games', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId, gameId],
        });

      expect(response.status).toBe(400);
    });

    it('should reject nonexistent games', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [randomUUID()],
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'GAME_UNAVAILABLE',
      );
    });

    it('should reject inactive games', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [inactiveGameId],
        });

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'GAME_UNAVAILABLE',
      );
    });

    it('should reject manipulated prices', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId],
          totalAmount: 1,
        });

      expect(response.status).toBe(400);
    });

    it('should reject manipulated order status', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId],
          status: 'PAID',
        });

      expect(response.status).toBe(400);
    });

    it('should reject orders created for another user', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId],
          userId: secondUserId,
        });

      expect(response.status).toBe(400);
    });

    it('should reject games already owned by the user', async () => {
      await prisma.libraryItem.create({
        data: {
          userId,
          gameId,
        },
      });

      try {
        const response = await request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            gameIds: [gameId],
          });

        expect(response.status).toBe(409);

        expect(response.body.error.code).toBe(
          'GAME_ALREADY_OWNED',
        );
      } finally {
        await prisma.libraryItem.deleteMany({
          where: {
            userId,
            gameId,
          },
        });
      }
    });

    it('should not persist an invalid partial order', async () => {
      const countBefore = await prisma.order.count({
        where: {
          userId,
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gameIds: [gameId, inactiveGameId],
        });

      expect(response.status).toBe(400);

      const countAfter = await prisma.order.count({
        where: {
          userId,
        },
      });

      expect(countAfter).toBe(countBefore);
    });
  });

  describe('GET /orders', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(401);
    });

    it('should list orders belonging to the authenticated user', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.orders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: orderId,
          }),
        ]),
      );

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should not list orders belonging to another user', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${secondToken}`);

      expect(response.status).toBe(200);

      expect(response.body.orders).toEqual([]);

      expect(response.body.pagination.total).toBe(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/orders?page=2&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.orders).toEqual([]);

      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 1,
        total: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should reject invalid pagination', async () => {
      const response = await request(app)
        .get('/orders?page=0&limit=100')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /orders/:id', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`);

      expect(response.status).toBe(401);
    });

    it('should return an order belonging to the authenticated user', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.order).toMatchObject({
        id: orderId,
        status: 'PENDING',
        totalAmount: 15000,
      });
    });

    it('should prevent access to another user order', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${secondToken}`);

      expect(response.status).toBe(404);

      expect(response.body.error.code).toBe(
        'ORDER_NOT_FOUND',
      );
    });

    it('should return 404 for nonexistent orders', async () => {
      const response = await request(app)
        .get(`/orders/${randomUUID()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should reject invalid order identifiers', async () => {
      const response = await request(app)
        .get('/orders/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});