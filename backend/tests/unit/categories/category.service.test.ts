import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import { CategoryService } from '../../../src/modules/categories/services/category.service.js';
import type { CategoryRepository } from '../../../src/modules/categories/repositories/category.repository.js';

describe('CategoryService', () => {
  const repository = {
    findAll: vi.fn<CategoryRepository['findAll']>(),
  };

  const service = new CategoryService(repository);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return categories with their game counts', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 'category-001',
        name: 'Ação',
        slug: 'action',
        _count: {
          games: 6,
        },
      },
      {
        id: 'category-002',
        name: 'RPG',
        slug: 'rpg',
        _count: {
          games: 6,
        },
      },
    ]);

    const result = await service.listCategories();

    expect(result).toEqual([
      {
        id: 'category-001',
        name: 'Ação',
        slug: 'action',
        gameCount: 6,
      },
      {
        id: 'category-002',
        name: 'RPG',
        slug: 'rpg',
        gameCount: 6,
      },
    ]);
  });

  it('should return categories without active games', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 'category-001',
        name: 'Corrida',
        slug: 'racing',
        _count: {
          games: 0,
        },
      },
    ]);

    const result = await service.listCategories();

    expect(result[0]?.gameCount).toBe(0);
  });

  it('should return an empty list when no categories exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await service.listCategories();

    expect(result).toEqual([]);
  });

  it('should not expose the internal Prisma count structure', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 'category-001',
        name: 'RPG',
        slug: 'rpg',
        _count: {
          games: 6,
        },
      },
    ]);

    const result = await service.listCategories();

    expect(result[0]).not.toHaveProperty('_count');
    expect(result[0]).toHaveProperty('gameCount', 6);
  });

  it('should propagate repository errors', async () => {
    repository.findAll.mockRejectedValue(
      new Error('Database unavailable'),
    );

    await expect(
      service.listCategories(),
    ).rejects.toThrow('Database unavailable');
  });
});