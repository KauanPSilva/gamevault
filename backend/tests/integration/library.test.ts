import { randomUUID } from 'node:crypto';

import request from 'supertest';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import app from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('Library integration', () => {
  const suffix = randomUUID();

  const userId = randomUUID();
  const otherUserId = randomUUID();
  const categoryId = randomUUID();

  const firstGameId = randomUUID();
  const secondGameId = randomUUID();
  const inactiveGameId = randomUUID();

  let token: string;
  let otherToken: string;

  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        {
          id: userId,
          name: 'Library Customer',
          email: `library-${suffix}@example.com`,
          passwordHash: 'test-password-hash',
          role: 'CUSTOMER',
        },
        {
          id: otherUserId,
          name: 'Other Customer',
          email: `other-library-${suffix}@example.com`,
          passwordHash: 'test-password-hash',
          role: 'CUSTOMER',
        },
      ],
    });

    token = generateToken({
      id: userId,
      role: 'CUSTOMER',
    });

    otherToken = generateToken({
      id: otherUserId,
      role: 'CUSTOMER',
    });

    await prisma.category.create({
      data: {
        id: categoryId,
        name: `Library Category ${suffix}`,
        slug: `library-category-${suffix}`,
      },
    });

    await prisma.game.createMany({
      data: [
        {
          id: firstGameId,
          title: 'First Library Game',
          slug: `first-library-game-${suffix}`,
          description: 'First test game',
          price: 10000,
          imageUrl: '/images/test.webp',
          categoryId,
        },
        {
          id: secondGameId,
          title: 'Second Library Game',
          slug: `second-library-game-${suffix}`,
          description: 'Second test game',
          price: 15000,
          imageUrl: '/images/test.webp',
          categoryId,
        },
        {
          id: inactiveGameId,
          title: 'Inactive Library Game',
          slug: `inactive-library-game-${suffix}`,
          description: 'Inactive test game',
          price: 20000,
          imageUrl: '/images/test.webp',
          categoryId,
          isActive: false,
        },
      ],
    });

    await prisma.libraryItem.createMany({
      data: [
        {
          userId,
          gameId: firstGameId,
          acquiredAt: new Date('2026-01-01T10:00:00Z'),
        },
        {
          userId,
          gameId: secondGameId,
          acquiredAt: new Date('2026-01-02T10:00:00Z'),
        },
        {
          userId,
          gameId: inactiveGameId,
          acquiredAt: new Date('2026-01-03T10:00:00Z'),
        },
      ],
    });
  });

  afterAll(async () => {
    try {
      await prisma.libraryItem.deleteMany({
        where: {
          userId: {
            in: [userId, otherUserId],
          },
        },
      });

      await prisma.game.deleteMany({
        where: { categoryId },
      });

      await prisma.category.deleteMany({
        where: { id: categoryId },
      });

      await prisma.user.deleteMany({
        where: {
          id: {
            in: [userId, otherUserId],
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  it('should reject unauthenticated requests', async () => {
    const response = await request(app).get('/library');

    expect(response.status).toBe(401);
  });

  it('should return an empty library for a new customer', async () => {
    const response = await request(app)
      .get('/library')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      total: 0,
    });
  });

  it('should return all games owned by the customer', async () => {
    const response = await request(app)
      .get('/library')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(3);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: expect.objectContaining({
            id: firstGameId,
            title: 'First Library Game',
          }),
        }),
      ]),
    );

    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('should not expose another customer library', async () => {
    const response = await request(app)
      .get('/library')
      .query({ userId })
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.total).toBe(0);
  });

  it('should sort games by acquisition date descending', async () => {
    const response = await request(app)
      .get('/library')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.items.map(
        (item: { game: { id: string } }) => item.game.id,
      ),
    ).toEqual([
      inactiveGameId,
      secondGameId,
      firstGameId,
    ]);
  });

  it('should preserve owned games that are inactive in the store', async () => {
    const response = await request(app)
      .get('/library')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: expect.objectContaining({
            id: inactiveGameId,
          }),
        }),
      ]),
    );
  });
});