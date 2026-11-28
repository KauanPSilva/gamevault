import { Router } from 'express';

import { authenticate } from '../../../middlewares/auth.middleware.js';
import { LibraryController } from '../controllers/library.controller.js';

const libraryRouter = Router();
const libraryController = new LibraryController();

libraryRouter.use(authenticate);

libraryRouter.get('/', libraryController.list);

export { libraryRouter };