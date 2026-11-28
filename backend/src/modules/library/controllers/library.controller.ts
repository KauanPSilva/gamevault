import type { Request, Response } from 'express';

import { AppError } from '../../../errors/app.error.js';
import { LibraryService } from '../services/library.service.js';

export class LibraryController {
  constructor(
    private readonly libraryService = new LibraryService(),
  ) {}

  list = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        401,
        'UNAUTHORIZED',
      );
    }

    const library = await this.libraryService.getLibrary(req.user.id);

    res.setHeader('Cache-Control', 'no-store');

    res.status(200).json(library);
  };
}