import { AppError } from '../../../errors/app.error.js';
import { GameRepository } from '../repositories/game.repository.js';
import type { ListGamesInput } from '../schemas/list-games.schema.js';

export class GameService {
  constructor(
    private readonly gameRepository = new GameRepository(),
  ) {}

  async listGames(input: ListGamesInput) {
    const { games, total } =
      await this.gameRepository.findAll(input);

    const totalPages = Math.ceil(total / input.limit);

    return {
      games,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
        hasNextPage: input.page < totalPages,
        hasPreviousPage: input.page > 1,
      },
    };
  }

  async getGameBySlug(slug: string) {
    const game = await this.gameRepository.findBySlug(slug);

    if (!game) {
      throw new AppError(
        'Game not found',
        404,
        'GAME_NOT_FOUND',
      );
    }

    return game;
  }
}