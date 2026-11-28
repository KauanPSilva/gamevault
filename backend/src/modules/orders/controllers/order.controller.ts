import type {
  Request,
  Response,
} from 'express';

import { AppError } from '../../../errors/app.error.js';

import { OrderService } from '../services/order.service.js';

import { createOrderSchema } from '../schemas/create-order.schema.js';
import { orderIdSchema } from '../schemas/order-id.schema.js';
import { listOrdersSchema } from '../schemas/list-orders.schema.js';

export class OrderController {
  constructor(
    private readonly orderService =
      new OrderService(),
  ) {}

  create = async (
    request: Request,
    response: Response,
  ) => {
    const userId = this.getUserId(request);

    const input = createOrderSchema.parse(
      request.body,
    );

    const order =
      await this.orderService.createOrder(
        userId,
        input,
      );

    response.setHeader(
      'Cache-Control',
      'no-store',
    );

    response.status(201).json({
      order,
    });
  };

  findById = async (
    request: Request,
    response: Response,
  ) => {
    const userId = this.getUserId(request);

    const { id } = orderIdSchema.parse(
      request.params,
    );

    const order =
      await this.orderService.getOrderById(
        userId,
        id,
      );

    response.setHeader(
      'Cache-Control',
      'no-store',
    );

    response.status(200).json({
      order,
    });
  };

  list = async (
    request: Request,
    response: Response,
  ) => {
    const userId = this.getUserId(request);

    const { page, limit } =
      listOrdersSchema.parse(request.query);

    const result =
      await this.orderService.listOrders(
        userId,
        page,
        limit,
      );

    response.setHeader(
      'Cache-Control',
      'no-store',
    );

    response.status(200).json(result);
  };

  private getUserId(
    request: Request,
  ): string {
    if (!request.user) {
      throw new AppError(
        'Authentication required',
        401,
        'UNAUTHORIZED',
      );
    }

    return request.user.id;
  }
}