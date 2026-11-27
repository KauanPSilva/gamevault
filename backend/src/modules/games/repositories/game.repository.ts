import { prisma } from '../../../config/database.js';
import type { Prisma } from '../../../generated/prisma/client.js';

export type GameSort =
  | 'title_asc'
  | 'title_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest';

export interface FindGamesInput {
  search?: string;
  category?: string;
  featured?: boolean;
  sort: GameSort;
  page: number;
  limit: number;
}

const gameSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  imageUrl: true,
  bannerUrl: true,
  accentColor: true,
  isFeatured: true,
  developer: true,
  publisher: true,
  releaseDate: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.GameSelect;

const sortOptions: Record<
  GameSort,
  Prisma.GameOrderByWithRelationInput
> = {
  title_asc: { title: 'asc' },
  title_desc: { title: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  newest: { createdAt: 'desc' },
};

export class GameRepository {
  async findAll(input: FindGamesInput) {
    const where: Prisma.GameWhereInput = {
      isActive: true,
    };

    if (input.search) {
      where.OR = [
        {
          title: {
            contains: input.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: input.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (input.category) {
      where.category = {
        slug: input.category,
      };
    }

    if (input.featured !== undefined) {
      where.isFeatured = input.featured;
    }

    const skip = (input.page - 1) * input.limit;

    const [games, total] = await prisma.$transaction(
      [
        prisma.game.findMany({
          where,
          select: gameSelect,
          orderBy: [
            sortOptions[input.sort],
            { id: 'asc' },
          ],
          skip,
          take: input.limit,
        }),
        prisma.game.count({
          where,
        }),
      ],
      {
        isolationLevel: 'RepeatableRead',
      },
    );

    return {
      games,
      total,
    };
  }

  async findBySlug(slug: string) {
    return prisma.game.findUnique({
      where: {
        slug,
        isActive: true,
      },
      select: gameSelect,
    });
  }
}