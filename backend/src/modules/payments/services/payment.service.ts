import { AppError } from '../../../errors/app.error.js';

import { Prisma } from '../../../generated/prisma/client.js';

import { gatewayRegistry } from '../gateways/index.js';

import { GatewayError } from '../gateways/errors/gateway.error.js';

import { PaymentRepository } from '../repositories/payment.repository.js';

import type { CreatePaymentInput } from '../schemas/create-payment.schema.js';

import type { SandboxPaymentGateway } from '../gateways/interfaces/sandbox-payment-gateway.interface.js';

import type { SimulatePaymentInput } from '../schemas/simulate-payment.schema.js';


export class PaymentService {
  constructor(
    private readonly paymentRepository =
      new PaymentRepository(),

    private readonly registry = gatewayRegistry,
  ) {}

  async listGateways() {
    const gateways =
      await this.paymentRepository.listActiveGateways();

    return gateways.filter((gateway) =>
      this.registry.has(gateway.code),
    );
  }

  async createPayment(
    userId: string,
    orderId: string,
    input: CreatePaymentInput,
  ) {
    const gateway = this.registry.get(
      input.gatewayCode,
    );

    const reservation = await this.reservePayment(
      userId,
      orderId,
      input,
    );

    const { payment, created } = reservation;

    if (!created) {
      return {
        payment,
        created: false,
      };
    }

    let result;

    try {
      result = await gateway.createPayment({
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.id,
        description: `GameVault order ${orderId}`,
        method: input.method,
      });

      if (
        result.status !== 'pending' ||
        result.simulated !== true ||
        result.amount !== payment.amount ||
        result.currency !== payment.currency ||
        result.reference !== payment.id ||
        !result.externalId ||
        !result.pixCode
      ) {
        throw new GatewayError(
          'Invalid payment creation response',
          502,
          'GATEWAY_PAYMENT_MISMATCH',
        );
      }
    } catch (error) {
      const definitiveFailure =
        error instanceof GatewayError &&
        [
          'GATEWAY_NOT_CONFIGURED',
          'GATEWAY_AUTH_ERROR',
          'INVALID_PAYMENT_AMOUNT',
        ].includes(error.code);

      const failureReason =
        error instanceof GatewayError
          ? error.code
          : 'PAYMENT_CREATION_ERROR';

      if (definitiveFailure) {
        await this.paymentRepository.markCreationFailed(
          payment.id,
          failureReason,
        );
      } else {
        await this.paymentRepository.markCreationUncertain(
          payment.id,
          failureReason,
        );
      }

      throw error;
    }

    const completedPayment =
      await this.paymentRepository.completeCreation(
        payment.id,
        result.externalId,
        result.pixCode,
      );

    return {
      payment: completedPayment,
      created: true,
    };
  }

  async getPaymentById(
    userId: string,
    paymentId: string,
  ) {
    const payment =
      await this.paymentRepository.findById(
        paymentId,
        userId,
      );

    if (!payment) {
      throw new AppError(
        'Payment not found',
        404,
        'PAYMENT_NOT_FOUND',
      );
    }

    return payment;
  }
  async getGatewayPaymentStatus(
    userId: string,
    paymentId: string,
    ) {
    const payment =
        await this.getPaymentById(
        userId,
        paymentId,
        );

    if (!payment.externalId) {
        throw new AppError(
        'Payment has no external identifier',
        409,
        'PAYMENT_NOT_SYNCHRONIZED',
        );
    }

    const gateway = this.registry.get(
        payment.gateway.code,
    );

    const result = await gateway.getPayment(
        payment.externalId,
    );

    if (
        result.externalId !== payment.externalId ||
        result.simulated !== true
    ) {
        throw new GatewayError(
        'Invalid gateway payment response',
        502,
        'GATEWAY_PAYMENT_MISMATCH',
        );
    }

    return {
        paymentId: payment.id,
        externalId: payment.externalId,
        gatewayCode: payment.gateway.code,
        localStatus: payment.status,
        gatewayStatus: result.status,
        simulated: result.simulated,
        checkedAt: new Date().toISOString(),
    };
    }
  async simulatePayment(
    userId: string,
    paymentId: string,
    input: SimulatePaymentInput,
    ) {
    const existingPayment =
        await this.getPaymentById(userId, paymentId);

    const gateway = this.registry.get(
        existingPayment.gateway.code,
    );

    if (!this.supportsSimulation(gateway)) {
        throw new AppError(
        'Gateway does not support simulation',
        409,
        'SIMULATION_NOT_AVAILABLE',
        );
    }

    const transitions = {
        approve: {
        external: 'approved',
        local: 'APPROVED',
        },

        decline: {
        external: 'declined',
        local: 'FAILED',
        },

        cancel: {
        external: 'cancelled',
        local: 'CANCELLED',
        },
    } as const;

    const transition = transitions[input.action];

    // Permite repetir uma ação já concluída
    // sem executar novamente a chamada externa.
    if (existingPayment.status === transition.local) {
        return existingPayment;
    }

    let payment;

    try {
        payment =
        await this.paymentRepository.reserveSimulation(
            paymentId,
            userId,
        );
    } catch (error) {
        if (
        error instanceof
            Prisma.PrismaClientKnownRequestError &&
        ['P2034', 'P2025'].includes(error.code)
        ) {
        throw new AppError(
            'Payment is being processed',
            409,
            'PAYMENT_PROCESSING_CONFLICT',
        );
        }

        throw error;
    }

    try {
        if (!payment.externalId) {
        throw new AppError(
            'Missing external payment identifier',
            500,
            'INVALID_PAYMENT_DATA',
        );
        }

        const actions = {
        approve: () =>
            gateway.approvePayment(payment.externalId!),

        decline: () =>
            gateway.declinePayment(payment.externalId!),

        cancel: () =>
            gateway.cancelPayment(payment.externalId!),
        };

        const result = await actions[input.action]();

        if (
        result.externalId !== payment.externalId ||
        result.simulated !== true ||
        result.status !== transition.external
        ) {
        throw new GatewayError(
            'Invalid payment simulation response',
            502,
            'GATEWAY_PAYMENT_MISMATCH',
        );
        }

        return await this.paymentRepository.completeSimulation(
        paymentId,
        userId,
        transition.local,
        );
    } catch (error) {
        const failureReason =
        error instanceof AppError
            ? error.code
            : 'PAYMENT_SIMULATION_ERROR';

        await this.paymentRepository.markSimulationUncertain(
        paymentId,
        failureReason,
        );

        if (
        error instanceof
            Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2034', 'P2025'].includes(error.code)
        ) {
        throw new AppError(
            'Payment requires reconciliation',
            409,
            'PAYMENT_RECONCILIATION_REQUIRED',
        );
        }

        throw error;
    }
    }

    private supportsSimulation(
        gateway: ReturnType<typeof gatewayRegistry.get>,
        ): gateway is SandboxPaymentGateway {
        return (
            'approvePayment' in gateway &&
            typeof gateway.approvePayment === 'function' &&

            'declinePayment' in gateway &&
            typeof gateway.declinePayment === 'function' &&

            'cancelPayment' in gateway &&
            typeof gateway.cancelPayment === 'function'
        );
        }

  private async reservePayment(
    userId: string,
    orderId: string,
    input: CreatePaymentInput,
  ) {
    try {
      return await this.paymentRepository.reservePayment(
        userId,
        orderId,
        input,
      );
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2034'].includes(error.code)
      ) {
        throw new AppError(
          'Payment reservation conflict. Retry using the same idempotency key',
          409,
          'PAYMENT_RESERVATION_CONFLICT',
        );
      }

      throw error;
    }
  }
}