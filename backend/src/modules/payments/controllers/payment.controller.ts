import type { Request, Response } from 'express';

import { AppError } from '../../../errors/app.error.js';

import { PaymentService } from '../services/payment.service.js';

import { createPaymentSchema } from '../schemas/create-payment.schema.js';

import { paymentIdSchema } from '../schemas/payment-id.schema.js';

import { orderIdSchema } from '../../orders/schemas/order-id.schema.js';

import { simulatePaymentSchema } from '../schemas/simulate-payment.schema.js';


export class PaymentController {
  constructor(
    private readonly paymentService =
      new PaymentService(),
  ) {}

  listGateways = async (
    request: Request,
    response: Response,
  ) => {
    const gateways =
      await this.paymentService.listGateways();

    response.setHeader('Cache-Control', 'no-store');

    response.status(200).json({
      gateways,
    });
  };

  create = async (
    request: Request,
    response: Response,
  ) => {
    const userId = this.getUserId(request);

    const { id: orderId } =
      orderIdSchema.parse(request.params);

    const input =
      createPaymentSchema.parse(request.body);

    const { payment, created } =
      await this.paymentService.createPayment(
        userId,
        orderId,
        input,
      );

    response.setHeader('Cache-Control', 'no-store');

    response.status(created ? 201 : 200).json({
      payment,
    });
  };

  findById = async (
    request: Request,
    response: Response,
  ) => {
    const userId = this.getUserId(request);

    const { id: paymentId } =
      paymentIdSchema.parse(request.params);

    const payment =
      await this.paymentService.getPaymentById(
        userId,
        paymentId,
      );

    response.setHeader('Cache-Control', 'no-store');

    response.status(200).json({
      payment,
    });
  };

  simulate = async (
    request: Request,
    response: Response,
        ) => {
        const userId = this.getUserId(request);

        const { id: paymentId } =
            paymentIdSchema.parse(request.params);

        const input =
            simulatePaymentSchema.parse(request.body);

        const payment =
            await this.paymentService.simulatePayment(
            userId,
            paymentId,
            input,
            );

        response.setHeader('Cache-Control', 'no-store');

        response.status(200).json({
            payment,
        });
    };
    findGatewayStatus = async (
        request: Request,
        response: Response,
        ) => {
        const userId = this.getUserId(request);

        const { id: paymentId } =
            paymentIdSchema.parse(request.params);

        const status =
            await this.paymentService.getGatewayPaymentStatus(
            userId,
            paymentId,
            );

        response.setHeader('Cache-Control', 'no-store');

        response.status(200).json({
            status,
        });
    };

  private getUserId(request: Request): string {
    if (!request.user) {
      throw new AppError(
        'Unauthorized',
        401,
        'UNAUTHORIZED',
      );
    }

    return request.user.id;
  }
}