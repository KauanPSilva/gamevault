import type { Request, Response } from 'express';
import { GameService } from '../services/game.service.js';
import { listGamesSchema } from '../schemas/list-games.schema.js';
import { gameSlugSchema } from '../schemas/game-slug.schema.js';

export class GameController {
  constructor(
    private readonly gameService = new GameService(),
  ) {}

  list = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const input = listGamesSchema.parse(req.query);

    const result = await this.gameService.listGames(input);

    res.status(200).json(result);
  };

  getBySlug = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { slug } = gameSlugSchema.parse(req.params);

    const game = await this.gameService.getGameBySlug(slug);

    res.status(200).json({ game });
  };
}