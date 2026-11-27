import { CategoryRepository } from '../repositories/category.repository.js';

export class CategoryService {
  constructor(
    private readonly categoryRepository =
      new CategoryRepository(),
  ) {}

  async listCategories() {
    const categories =
      await this.categoryRepository.findAll();

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      gameCount: category._count.games,
    }));
  }
}