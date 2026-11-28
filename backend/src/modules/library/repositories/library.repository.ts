import { prisma } from '../../../config/database.js';

export class LibraryRepository {
  async findAllByUserId(userId: string) {
    return prisma.libraryItem.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        acquiredAt: true,
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            bannerUrl: true,
            accentColor: true,
            developer: true,
            publisher: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [
        { acquiredAt: 'desc' },
        { id: 'asc' },
      ],
    });
  }
}