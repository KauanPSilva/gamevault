import { prisma } from '../../../config/database.js';

import { AppError } from '../../../errors/app.error.js';

import { Prisma } from '../../../generated/prisma/client.js';

const orderSelect = {
  id: true,
  status: true,
  totalAmount: true,
  currency: true,
  createdAt: true,
  updatedAt: true,

  items: {
    select: {
      id: true,
      unitPrice: true,

      game: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          accentColor: true,
        },
      },
    },
  },

  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      paymentMethod: true,
      paidAt: true,
      createdAt: true,

      gateway: {
        select: {
          name: true,
          code: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  },
} satisfies Prisma.OrderSelect;

export class OrderRepository {
  async create(
    userId: string,
    gameIds: string[],
  ) {
    return prisma.$transaction(
      async (transaction) => {
        const games = await transaction.game.findMany({
          where: {
            id: {
              in: gameIds,
            },

            isActive: true,
          },

          select: {
            id: true,
            price: true,
          },
        });

        if (games.length !== gameIds.length) {
          throw new AppError(
            'One or more games are unavailable',
            400,
            'GAME_UNAVAILABLE',
          );
        }

        const ownedGames =
          await transaction.libraryItem.findMany({
            where: {
              userId,

              gameId: {
                in: gameIds,
              },
            },

            select: {
              gameId: true,
            },
          });

        if (ownedGames.length > 0) {
          throw new AppError(
            'One or more games are already owned',
            409,
            'GAME_ALREADY_OWNED',
          );
        }

        const totalAmount = games.reduce(
          (total, game) => total + game.price,
          0,
        );

        if (
          games.some(
            (game) =>
              !Number.isSafeInteger(game.price) ||
              game.price <= 0,
          ) ||
          !Number.isSafeInteger(totalAmount) ||
          totalAmount <= 0 ||
          totalAmount > 2_147_483_647
        ) {
          throw new AppError(
            'Invalid order amount',
            500,
            'INVALID_ORDER_AMOUNT',
          );
        }

        return transaction.order.create({
          data: {
            userId,
            status: 'PENDING',
            currency: 'BRL',
            totalAmount,

            items: {
              create: games.map((game) => ({
                gameId: game.id,
                unitPrice: game.price,
              })),
            },
          },

          select: orderSelect,
        });
      },

      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async findById(
    orderId: string,
    userId: string,
  ) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },

      select: orderSelect,
    });
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    return prisma.$transaction(
      [
        prisma.order.findMany({
          where: {
            userId,
          },

          select: orderSelect,

          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'asc',
            },
          ],

          skip: (page - 1) * limit,
          take: limit,
        }),

        prisma.order.count({
          where: {
            userId,
          },
        }),
      ],

      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.RepeatableRead,
      },
    );
  }
}