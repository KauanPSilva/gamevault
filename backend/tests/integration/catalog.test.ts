import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'vitest';

import request from 'supertest';
import { randomUUID } from 'node:crypto';

import app from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

const testId = randomUUID();

const categorySlug = `test-category-${testId}`;
const searchTerm = `catalog-${testId}`;

const featuredSlug = `featured-${testId}`;
const regularSlug = `regular-${testId}`;
const inactiveSlug = `inactive-${testId}`;

let categoryId: string | undefined;

describe('Catalog Integration', () => {
  beforeAll(async () => {
    const category = await prisma.category.create({
      data: {
        name: `Test Category ${testId}`,
        slug: categorySlug,
      },
    });

    categoryId = category.id;

    await prisma.game.createMany({
      data: [
        {
          title: `Alpha ${searchTerm}`,
          slug: featuredSlug,
          description: 'Featured integration test game.',
          price: 10000,
          imageUrl: '/images/test.webp',
          accentColor: '#F472B6',
          isFeatured: true,
          isActive: true,
          categoryId,
        },
        {
          title: `Beta ${searchTerm}`,
          slug: regularSlug,
          description: 'Regular integration test game.',
          price: 20000,
          imageUrl: '/images/test.webp',
          accentColor: '#22D3EE',
          isFeatured: false,
          isActive: true,
          categoryId,
        },
        {
          title: `Inactive ${searchTerm}`,
          slug: inactiveSlug,
          description: 'Inactive integration test game.',
          price: 5000,
          imageUrl: '/images/test.webp',
          isFeatured: true,
          isActive: false,
          categoryId,
        },
      ],
    });
  });

  afterAll(async () => {
    try {
      if (categoryId) {
        await prisma.$transaction([
          prisma.game.deleteMany({
            where: { categoryId },
          }),
          prisma.category.deleteMany({
            where: { id: categoryId },
          }),
        ]);
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('GET /games', () => {
    it('should allow public access', async () => {
      const response = await request(app)
        .get('/games');

      expect(response.status).toBe(200);
      expect(response.body.games).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter games by category', async () => {
      const response = await request(app)
        .get('/games')
        .query({ category: categorySlug });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);

      expect(
        response.body.games.map(
          (game: { slug: string }) => game.slug,
        ),
      ).toEqual(
        expect.arrayContaining([
          featuredSlug,
          regularSlug,
        ]),
      );
    });

    it('should search games case-insensitively', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          search: searchTerm.toUpperCase(),
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(2);
    });

    it('should exclude inactive games', async () => {
      const response = await request(app)
        .get('/games')
        .query({ category: categorySlug });

      const slugs = response.body.games.map(
        (game: { slug: string }) => game.slug,
      );

      expect(response.status).toBe(200);
      expect(slugs).not.toContain(inactiveSlug);
    });

    it('should return only active featured games', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          category: categorySlug,
          featured: 'true',
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(1);
      expect(response.body.games[0].slug).toBe(
        featuredSlug,
      );
    });

    it('should return non-featured games', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          category: categorySlug,
          featured: 'false',
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(1);
      expect(response.body.games[0].slug).toBe(
        regularSlug,
      );
    });

    it.each([
      ['price_asc', featuredSlug, regularSlug],
      ['price_desc', regularSlug, featuredSlug],
      ['title_asc', featuredSlug, regularSlug],
      ['title_desc', regularSlug, featuredSlug],
    ])(
      'should sort games by %s',
      async (sort, first, second) => {
        const response = await request(app)
          .get('/games')
          .query({
            category: categorySlug,
            sort,
          });

        expect(response.status).toBe(200);

        expect(
          response.body.games.map(
            (game: { slug: string }) => game.slug,
          ),
        ).toEqual([first, second]);
      },
    );

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          category: categorySlug,
          sort: 'price_asc',
          page: '1',
          limit: '1',
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(1);
      expect(response.body.games[0].slug).toBe(
        featuredSlug,
      );

      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should return the second page', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          category: categorySlug,
          sort: 'price_asc',
          page: '2',
          limit: '1',
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(1);
      expect(response.body.games[0].slug).toBe(
        regularSlug,
      );

      expect(
        response.body.pagination.hasNextPage,
      ).toBe(false);

      expect(
        response.body.pagination.hasPreviousPage,
      ).toBe(true);
    });

    it('should return an empty list for unknown games', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          search: randomUUID(),
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return an empty out-of-range page', async () => {
      const response = await request(app)
        .get('/games')
        .query({
          category: categorySlug,
          page: '100',
        });

      expect(response.status).toBe(200);
      expect(response.body.games).toEqual([]);
      expect(response.body.pagination.total).toBe(2);
    });

    it.each([
      { page: '0' },
      { limit: '51' },
      { sort: 'invalid' },
      { featured: 'invalid' },
      { unknown: 'value' },
    ])(
      'should reject invalid query parameters: %j',
      async (query) => {
        const response = await request(app)
          .get('/games')
          .query(query);

        expect(response.status).toBe(400);

        expect(response.body.error.code).toBe(
          'VALIDATION_ERROR',
        );
      },
    );
  });

  describe('GET /games/:slug', () => {
    it('should return public game details', async () => {
      const response = await request(app)
        .get(`/games/${featuredSlug}`);

      expect(response.status).toBe(200);

      expect(response.body.game).toMatchObject({
        slug: featuredSlug,
        price: 10000,
        accentColor: '#F472B6',
        isFeatured: true,
        category: {
          slug: categorySlug,
        },
      });
    });

    it('should return 404 for an unknown game', async () => {
      const response = await request(app)
        .get(`/games/unknown-${testId}`);

      expect(response.status).toBe(404);

      expect(response.body.error.code).toBe(
        'GAME_NOT_FOUND',
      );
    });

    it('should not expose inactive game details', async () => {
      const response = await request(app)
        .get(`/games/${inactiveSlug}`);

      expect(response.status).toBe(404);

      expect(response.body.error.code).toBe(
        'GAME_NOT_FOUND',
      );
    });

    it('should reject invalid slugs', async () => {
      const response = await request(app)
        .get('/games/INVALID-SLUG');

      expect(response.status).toBe(400);

      expect(response.body.error.code).toBe(
        'VALIDATION_ERROR',
      );
    });
  });

  describe('GET /categories', () => {
    it('should allow public access', async () => {
      const response = await request(app)
        .get('/categories');

      expect(response.status).toBe(200);

      expect(
        response.body.categories,
      ).toBeInstanceOf(Array);
    });

    it('should count only active games', async () => {
      const response = await request(app)
        .get('/categories');

      const category = response.body.categories.find(
        (item: { slug: string }) =>
          item.slug === categorySlug,
      );

      expect(response.status).toBe(200);

      expect(category).toMatchObject({
        slug: categorySlug,
        gameCount: 2,
      });

      expect(category).not.toHaveProperty('_count');
    });
  });
});