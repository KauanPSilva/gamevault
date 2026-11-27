import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.get('/', categoryController.list);

export { categoryRouter };