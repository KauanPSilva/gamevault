import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import { GameService } from '../../../src/modules/games/services/game.service.js';
import type { GameRepository } from '../../../src/modules/games/repositories/game.repository.js';
import type { ListGamesInput } from '../../../src/modules/games/schemas/list-games.schema.js';

const mockGame = {
  id: 'game-001',
  title: 'Grand Theft Auto VI',
  slug: 'grand-theft-auto-vi',
  description: 'Explore Vice City.',
  price: 34990,
  imageUrl: '/images/games/gta-vi/cover.webp',
  bannerUrl: '/images/games/gta-vi/banner.webp',
  accentColor: '#F472B6',
  isFeatured: true,
  developer: 'Rockstar Games',
  publisher: 'Rockstar Games',
  releaseDate: null,
  createdAt: new Date('2026-11-27'),
  category: {
    id: 'category-001',
    name: 'Ação',
    slug: 'action',
  },
};

const defaultInput: ListGamesInput = {
  page: 1,
  limit: 12,
  sort: 'newest',
};

describe('GameService', () => {
  const repository = {
    findAll: vi.fn<GameRepository['findAll']>(),
    findBySlug: vi.fn<GameRepository['findBySlug']>(),
  };

  const service = new GameService(repository);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('listGames', () => {
    it('should return games with pagination metadata', async () => {
      repository.findAll.mockResolvedValue({
        games: [mockGame],
        total: 20,
      });

      const result = await service.listGames(defaultInput);

      expect(result.games).toEqual([mockGame]);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 20,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should forward filters to the repository', async () => {
      const input: ListGamesInput = {
        ...defaultInput,
        search: 'GTA',
        category: 'action',
        featured: true,
        sort: 'price_asc',
      };

      repository.findAll.mockResolvedValue({
        games: [],
        total: 0,
      });

      await service.listGames(input);

      expect(repository.findAll).toHaveBeenCalledOnce();
      expect(repository.findAll).toHaveBeenCalledWith(input);
    });

    it('should correctly calculate the last page', async () => {
      repository.findAll.mockResolvedValue({
        games: [mockGame],
        total: 20,
      });

      const result = await service.listGames({
        ...defaultInput,
        page: 2,
      });

      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should return an empty list when no games match', async () => {
      repository.findAll.mockResolvedValue({
        games: [],
        total: 0,
      });

      const result = await service.listGames(defaultInput);

      expect(result.games).toEqual([]);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should return an empty list for an out-of-range page', async () => {
      repository.findAll.mockResolvedValue({
        games: [],
        total: 20,
      });

      const result = await service.listGames({
        ...defaultInput,
        page: 10,
      });

      expect(result.games).toEqual([]);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should propagate repository errors', async () => {
      repository.findAll.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(
        service.listGames(defaultInput),
      ).rejects.toThrow('Database unavailable');
    });
  });

  describe('getGameBySlug', () => {
    it('should return a game by its slug', async () => {
      repository.findBySlug.mockResolvedValue(mockGame);

      const result = await service.getGameBySlug(
        'grand-theft-auto-vi',
      );

      expect(result).toEqual(mockGame);

      expect(repository.findBySlug).toHaveBeenCalledWith(
        'grand-theft-auto-vi',
      );
    });

    it('should throw a 404 error when the game is not found', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(
        service.getGameBySlug('unknown-game'),
      ).rejects.toMatchObject({
        message: 'Game not found',
        statusCode: 404,
        code: 'GAME_NOT_FOUND',
      });
    });

    it('should propagate repository errors', async () => {
      repository.findBySlug.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(
        service.getGameBySlug('grand-theft-auto-vi'),
      ).rejects.toThrow('Database unavailable');
    });
  });
});