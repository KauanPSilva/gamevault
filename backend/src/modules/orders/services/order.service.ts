import { AppError } from '../../../errors/app.error.js';

import { Prisma } from '../../../generated/prisma/client.js';

import { OrderRepository } from '../repositories/order.repository.js';

import type { CreateOrderInput } from '../schemas/create-order.schema.js';

export class OrderService {
  constructor(
    private readonly orderRepository =
      new OrderRepository(),
  ) {}

  async createOrder(
    userId: string,
    input: CreateOrderInput,
  ) {
    try {
      return await this.orderRepository.create(
        userId,
        input.gameIds,
      );
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new AppError(
          'Order creation conflict. Please try again',
          409,
          'ORDER_CREATION_CONFLICT',
        );
      }

      throw error;
    }
  }

  async getOrderById(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.orderRepository.findById(
        orderId,
        userId,
      );

    if (!order) {
      throw new AppError(
        'Order not found',
        404,
        'ORDER_NOT_FOUND',
      );
    }

    return order;
  }

  async listOrders(
    userId: string,
    page: number,
    limit: number,
  ) {
    const [orders, total] =
      await this.orderRepository.findByUserId(
        userId,
        page,
        limit,
      );

    const totalPages = Math.ceil(total / limit);

    return {
      orders,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}