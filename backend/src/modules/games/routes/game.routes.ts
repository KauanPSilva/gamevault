import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';

const gameRouter = Router();
const gameController = new GameController();

gameRouter.get('/', gameController.list);
gameRouter.get('/:slug', gameController.getBySlug);

export { gameRouter };