import { LibraryRepository } from '../repositories/library.repository.js';

export class LibraryService {
  constructor(
    private readonly libraryRepository = new LibraryRepository(),
  ) {}

  async getLibrary(userId: string) {
    const items = await this.libraryRepository.findAllByUserId(userId);

    return {
      items,
      total: items.length,
    };
  }
}