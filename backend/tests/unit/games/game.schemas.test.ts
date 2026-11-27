import { describe, it, expect } from 'vitest';

import { listGamesSchema } from '../../../src/modules/games/schemas/list-games.schema.js';
import { gameSlugSchema } from '../../../src/modules/games/schemas/game-slug.schema.js';

describe('List Games Schema', () => {
  it('should apply default pagination and sorting', () => {
    const result = listGamesSchema.parse({});

    expect(result).toEqual({
      page: 1,
      limit: 12,
      sort: 'newest',
    });
  });

  it('should parse valid query parameters', () => {
    const result = listGamesSchema.parse({
      search: 'Cyberpunk',
      category: 'rpg',
      featured: 'true',
      sort: 'price_asc',
      page: '2',
      limit: '20',
    });

    expect(result).toEqual({
      search: 'Cyberpunk',
      category: 'rpg',
      featured: true,
      sort: 'price_asc',
      page: 2,
      limit: 20,
    });
  });

  it('should trim search parameters', () => {
    const result = listGamesSchema.parse({
      search: '  Cyberpunk  ',
    });

    expect(result.search).toBe('Cyberpunk');
  });

  it('should correctly parse featured=false', () => {
    const result = listGamesSchema.parse({
      featured: 'false',
    });

    expect(result.featured).toBe(false);
  });

  it.each([
    'title_asc',
    'title_desc',
    'price_asc',
    'price_desc',
    'newest',
  ])('should accept sorting option %s', (sort) => {
    expect(
      listGamesSchema.safeParse({ sort }).success,
    ).toBe(true);
  });

  it.each([
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: 'abc' },
    { page: '10001' },
    { limit: '0' },
    { limit: '51' },
    { limit: '1.5' },
    { limit: 'abc' },
    { featured: 'invalid' },
    { sort: 'invalid' },
    { search: '' },
    { search: '   ' },
    { search: 'a'.repeat(101) },
    { category: 'invalid category' },
    { category: '../rpg' },
    { unknown: 'value' },
    { page: ['1', '2'] },
  ])('should reject invalid query: %j', (query) => {
    expect(
      listGamesSchema.safeParse(query).success,
    ).toBe(false);
  });

  it('should accept pagination boundaries', () => {
    const result = listGamesSchema.parse({
      page: '10000',
      limit: '50',
    });

    expect(result.page).toBe(10000);
    expect(result.limit).toBe(50);
  });
});

describe('Game Slug Schema', () => {
  it.each([
    'grand-theft-auto-vi',
    '007-first-light',
    'cyberpunk-2077',
    'battlefield-6',
  ])('should accept valid slug: %s', (slug) => {
    expect(
      gameSlugSchema.safeParse({ slug }).success,
    ).toBe(true);
  });

  it.each([
    '',
    '   ',
    'Grand Theft Auto VI',
    'GTA-VI',
    '../game',
    'game--slug',
    '-game',
    'game-',
    'a'.repeat(151),
  ])('should reject invalid slug: %s', (slug) => {
    expect(
      gameSlugSchema.safeParse({ slug }).success,
    ).toBe(false);
  });

  it('should reject missing slug', () => {
    expect(
      gameSlugSchema.safeParse({}).success,
    ).toBe(false);
  });
});