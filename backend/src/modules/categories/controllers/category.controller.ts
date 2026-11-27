import type { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';

export class CategoryController {
  constructor(
    private readonly categoryService = new CategoryService(),
  ) {}

  list = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const categories =
      await this.categoryService.listCategories();

    res.status(200).json({ categories });
  };
}