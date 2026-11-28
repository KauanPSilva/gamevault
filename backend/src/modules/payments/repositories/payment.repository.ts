import { prisma } from '../../../config/database.js';

import { Prisma } from '../../../generated/prisma/client.js';

import { AppError } from '../../../errors/app.error.js';

import type { CreatePaymentInput } from '../schemas/create-payment.schema.js';

const paymentSelect = {
  id: true,
  externalId: true,
  amount: true,
  currency: true,
  status: true,
  paymentMethod: true,
  failureReason: true,
  pixCode: true,
  simulated: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  orderId: true,

  gateway: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} satisfies Prisma.PaymentSelect;

export type PaymentRecord =
  Prisma.PaymentGetPayload<{
    select: typeof paymentSelect;
  }>;

export class PaymentRepository {
  async listActiveGateways() {
    return prisma.paymentGateway.findMany({
      where: {
        isActive: true,
      },

      select: {
        name: true,
        code: true,
        description: true,
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(
    paymentId: string,
    userId: string,
  ) {
    return prisma.payment.findFirst({
      where: {
        id: paymentId,

        order: {
          userId,
        },
      },

      select: paymentSelect,
    });
  }

  async reservePayment(
    userId: string,
    orderId: string,
    input: CreatePaymentInput,
  ) {
    return prisma.$transaction(
      async (transaction) => {
        const order =
          await transaction.order.findFirst({
            where: {
              id: orderId,
              userId,
            },

            select: {
              id: true,
              status: true,
              totalAmount: true,
              currency: true,

              items: {
                select: {
                  gameId: true,
                },
              },
            },
          });

        if (!order) {
          throw new AppError(
            'Order not found',
            404,
            'ORDER_NOT_FOUND',
          );
        }

        const existingPayment =
          await transaction.payment.findUnique({
            where: {
              idempotencyKey:
                input.idempotencyKey,
            },

            select: paymentSelect,
          });

        if (existingPayment) {
          if (
            existingPayment.orderId !== orderId ||
            existingPayment.gateway.code !==
              input.gatewayCode ||
            existingPayment.paymentMethod !==
              input.method
          ) {
            throw new AppError(
              'Idempotency key conflict',
              409,
              'IDEMPOTENCY_KEY_CONFLICT',
            );
          }

          return {
            payment: existingPayment,
            created: false,
          };
        }

        if (order.status !== 'PENDING') {
          throw new AppError(
            'Order cannot receive payments',
            409,
            'ORDER_NOT_PAYABLE',
          );
        }

        if (
          !Number.isSafeInteger(order.totalAmount) ||
          order.totalAmount <= 0 ||
          order.currency !== 'BRL' ||
          order.items.length === 0
        ) {
          throw new AppError(
            'Invalid order data',
            500,
            'INVALID_ORDER_DATA',
          );
        }

        const gateway =
          await transaction.paymentGateway.findUnique({
            where: {
              code: input.gatewayCode,
            },

            select: {
              id: true,
              isActive: true,
            },
          });

        if (!gateway || !gateway.isActive) {
          throw new AppError(
            'Payment gateway is unavailable',
            400,
            'GATEWAY_UNAVAILABLE',
          );
        }

        const activePayment =
          await transaction.payment.findFirst({
            where: {
              orderId,

              status: {
                in: [
                  'PENDING',
                  'PROCESSING',
                  'APPROVED',
                ],
              },
            },

            select: {
              id: true,
            },
          });

        if (activePayment) {
          throw new AppError(
            'Order already has an active payment',
            409,
            'PAYMENT_ALREADY_EXISTS',
          );
        }

        const ownedGames =
          await transaction.libraryItem.count({
            where: {
              userId,

              gameId: {
                in: order.items.map(
                  (item) => item.gameId,
                ),
              },
            },
          });

        if (ownedGames > 0) {
          throw new AppError(
            'One or more games are already owned',
            409,
            'GAME_ALREADY_OWNED',
          );
        }

        const payment =
          await transaction.payment.create({
            data: {
              orderId,
              gatewayId: gateway.id,

              idempotencyKey:
                input.idempotencyKey,

              amount: order.totalAmount,
              currency: order.currency,
              paymentMethod: input.method,
              status: 'PROCESSING',
              simulated: true,
            },

            select: paymentSelect,
          });

        return {
          payment,
          created: true,
        };
      },

      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async completeCreation(
    paymentId: string,
    externalId: string,
    pixCode: string,
  ) {
    return prisma.payment.update({
      where: {
        id: paymentId,
        status: 'PROCESSING',
        externalId: null,
      },

      data: {
        externalId,
        pixCode,
        status: 'PENDING',
        failureReason: null,
      },

      select: paymentSelect,
    });
  }

  async markCreationFailed(
    paymentId: string,
    failureReason: string,
  ) {
    return prisma.payment.update({
      where: {
        id: paymentId,
        status: 'PROCESSING',
        externalId: null,
      },

      data: {
        status: 'FAILED',
        failureReason,
      },

      select: paymentSelect,
    });
  }

  async markCreationUncertain(
    paymentId: string,
    failureReason: string,
  ) {
    return prisma.payment.update({
      where: {
        id: paymentId,
        status: 'PROCESSING',
        externalId: null,
      },

      data: {
        failureReason,
      },

      select: paymentSelect,
    });
  }
  async reserveSimulation(
        paymentId: string,
        userId: string,
    ) {
    return prisma.$transaction(
        async (transaction) => {
            const payment = await transaction.payment.findFirst({
                where: {
                id: paymentId,
                order: {
                    userId,
                },
                },

                select: {
                ...paymentSelect,

                order: {
                    select: {
                    status: true,

                    items: {
                        select: {
                        gameId: true,
                        },
                    },
                    },
                },
                },
            });

            if (!payment) {
                throw new AppError(
                'Payment not found',
                404,
                'PAYMENT_NOT_FOUND',
                );
            }

            if (
                payment.status !== 'PENDING' ||
                payment.order.status !== 'PENDING'
            ) {
                throw new AppError(
                'Payment cannot be processed',
                409,
                'INVALID_PAYMENT_STATUS',
                );
            }

            if (!payment.simulated || !payment.externalId) {
                throw new AppError(
                'Payment does not support simulation',
                409,
                'SIMULATION_NOT_AVAILABLE',
                );
            }

            const ownedGames =
                await transaction.libraryItem.count({
                where: {
                    userId,

                    gameId: {
                    in: payment.order.items.map(
                        (item) => item.gameId,
                    ),
                    },
                },
                });

            if (ownedGames > 0) {
                throw new AppError(
                'One or more games are already owned',
                409,
                'GAME_ALREADY_OWNED',
                );
            }

            return transaction.payment.update({
                where: {
                id: paymentId,
                status: 'PENDING',
                },

                data: {
                status: 'PROCESSING',
                failureReason: null,
                },

                select: paymentSelect,
            });
            },

            {
            isolationLevel:
                Prisma.TransactionIsolationLevel.Serializable,
            },
        );
    }
    async completeSimulation(
        paymentId: string,
        userId: string,
        status: 'APPROVED' | 'FAILED' | 'CANCELLED',
        ) {
        return prisma.$transaction(
            async (transaction) => {
            const payment = await transaction.payment.findFirst({
                where: {
                id: paymentId,

                order: {
                    userId,
                },
                },

                select: {
                id: true,
                status: true,
                externalId: true,
                simulated: true,
                orderId: true,

                order: {
                    select: {
                    status: true,

                    items: {
                        select: {
                        gameId: true,
                        },
                    },
                    },
                },
                },
            });

            if (!payment) {
                throw new AppError(
                'Payment not found',
                404,
                'PAYMENT_NOT_FOUND',
                );
            }

            if (
                payment.status !== 'PROCESSING' ||
                payment.order.status !== 'PENDING' ||
                !payment.simulated ||
                !payment.externalId
            ) {
                throw new AppError(
                'Invalid payment transition',
                409,
                'INVALID_PAYMENT_STATUS',
                );
            }

            const approved = status === 'APPROVED';

            const updatedPayment =
                await transaction.payment.update({
                where: {
                    id: paymentId,
                    status: 'PROCESSING',
                },

                data: {
                    status,

                    paidAt: approved
                    ? new Date()
                    : null,

                    failureReason:
                    status === 'FAILED'
                        ? 'PAYMENT_DECLINED'
                        : null,
                },

                select: paymentSelect,
                });

            await transaction.order.update({
                where: {
                id: payment.orderId,
                status: 'PENDING',
                },

                data: {
                status: approved
                    ? 'PAID'
                    : status === 'CANCELLED'
                    ? 'CANCELLED'
                    : 'FAILED',
                },
            });

            if (approved) {
                await transaction.libraryItem.createMany({
                data: payment.order.items.map(
                    (item) => ({
                    userId,
                    gameId: item.gameId,
                    }),
                ),
                });
            }

            return updatedPayment;
            },

            {
            isolationLevel:
                Prisma.TransactionIsolationLevel.Serializable,
            },
        );
        }

        async markSimulationUncertain(
            paymentId: string,
            failureReason: string,
            ) {
            return prisma.payment.update({
                where: {
                id: paymentId,
                status: 'PROCESSING',
                },

                data: {
                failureReason,
                },

                select: paymentSelect,
            });
        }
}