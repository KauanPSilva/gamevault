import { env } from '../../../../config/env.js';

import type {
  CreatePaymentInput,
  GatewayPaymentResult,
} from '../interfaces/payment-gateway.interface.js';

import type {
  SandboxPaymentGateway,
} from '../interfaces/sandbox-payment-gateway.interface.js';

import {
  juntosSeFazPaymentSchema,
} from '../schemas/juntos-se-faz.schema.js';

import { GatewayError } from '../errors/gateway.error.js';

export class JuntosSeFazAdapter implements SandboxPaymentGateway {
  readonly code = 'juntos-se-faz';
  readonly name = 'Juntos Se Faz';

  constructor(
    private readonly baseUrl = env.JUNTOS_SE_FAZ_BASE_URL,
    private readonly apiToken = env.JUNTOS_SE_FAZ_API_TOKEN,
    private readonly timeoutMs = env.JUNTOS_SE_FAZ_TIMEOUT_MS
  ) {}

  async createPayment(
    input: CreatePaymentInput
  ): Promise<GatewayPaymentResult> {
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new GatewayError(
        'Invalid payment amount',
        400,
        'INVALID_PAYMENT_AMOUNT'
      );
    }

    const result = await this.request('POST', '/payments', {
      amount: input.amount / 100,
      currency: input.currency,
      reference: input.reference,
      description: input.description,
      method: input.method,
    });

    if (
      result.amount !== input.amount ||
      result.currency !== input.currency ||
      result.reference !== input.reference ||
      (input.method === 'pix' && !result.pixCode)
    ) {
      throw new GatewayError(
        'Gateway returned inconsistent payment data',
        502,
        'GATEWAY_PAYMENT_MISMATCH'
      );
    }

    return result;
  }

  async getPayment(
    externalId: string
  ): Promise<GatewayPaymentResult> {
    const result = await this.request(
      'GET',
      `/payments/${encodeURIComponent(externalId)}`
    );

    return this.validatePaymentId(result, externalId);
  }

  async approvePayment(
    externalId: string
  ): Promise<GatewayPaymentResult> {
    return this.executeAction(externalId, 'approve');
  }

  async declinePayment(
    externalId: string
  ): Promise<GatewayPaymentResult> {
    return this.executeAction(externalId, 'decline');
  }

  async cancelPayment(
    externalId: string
  ): Promise<GatewayPaymentResult> {
    return this.executeAction(externalId, 'cancel');
  }

  private async executeAction(
    externalId: string,
    action: 'approve' | 'decline' | 'cancel'
  ): Promise<GatewayPaymentResult> {
    const result = await this.request(
      'POST',
      `/payments/${encodeURIComponent(externalId)}/${action}`,
      {
        reason: `GameVault sandbox ${action}`,
      }
    );

    const expectedStatuses = {
      approve: 'approved',
      decline: 'declined',
      cancel: 'cancelled',
    } as const;

    if (result.status !== expectedStatuses[action]) {
      throw new GatewayError(
        'Gateway returned an unexpected payment status',
        502,
        'GATEWAY_STATUS_MISMATCH'
      );
    }

    return this.validatePaymentId(result, externalId);
  }

  private validatePaymentId(
    result: GatewayPaymentResult,
    externalId: string
  ): GatewayPaymentResult {
    if (result.externalId !== externalId) {
      throw new GatewayError(
        'Gateway returned an unexpected payment ID',
        502,
        'GATEWAY_PAYMENT_MISMATCH'
      );
    }

    return result;
  }

  private async request(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>
  ): Promise<GatewayPaymentResult> {
    if (!this.apiToken?.trim()) {
      throw new GatewayError(
        'Payment gateway is not configured',
        503,
        'GATEWAY_NOT_CONFIGURED'
      );
    }

    const signal = AbortSignal.timeout(this.timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl.replace(/\/+$/, '')}${path}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
          signal,
          redirect: 'error',
        }
      );

      if (!response.ok) {
        throw this.mapHttpError(response.status);
      }

      const data: unknown = await response.json();

      const parsed = juntosSeFazPaymentSchema.safeParse(data);

      if (!parsed.success) {
        throw new GatewayError(
          'Invalid response from payment gateway',
          502,
          'GATEWAY_INVALID_RESPONSE'
        );
      }

      const payment = parsed.data;

      return {
        externalId: payment.id,
        status: payment.status,
        amount:
          payment.amount !== undefined
            ? Math.round(payment.amount * 100)
            : undefined,
        currency: payment.currency,
        reference: payment.reference,
        pixCode: payment.pix_code,
        simulated: payment.simulated,
      };
    } catch (error) {
      if (error instanceof GatewayError) {
        throw error;
      }

      if (signal.aborted) {
        throw new GatewayError(
          'Payment gateway request timed out',
          504,
          'GATEWAY_TIMEOUT'
        );
      }

      if (error instanceof SyntaxError) {
        throw new GatewayError(
          'Invalid response from payment gateway',
          502,
          'GATEWAY_INVALID_RESPONSE'
        );
      }

      throw new GatewayError(
        'Unable to communicate with payment gateway',
        502,
        'GATEWAY_CONNECTION_ERROR'
      );
    }
  }

  private mapHttpError(status: number): GatewayError {
    switch (status) {
      case 401:
      case 403:
        return new GatewayError(
          'Payment gateway authentication failed',
          502,
          'GATEWAY_AUTH_ERROR'
        );

      case 429:
        return new GatewayError(
          'Payment gateway rate limit exceeded',
          503,
          'GATEWAY_RATE_LIMIT'
        );

      case 503:
        return new GatewayError(
          'Payment gateway temporarily unavailable',
          503,
          'GATEWAY_UNAVAILABLE'
        );

      default:
        return new GatewayError(
          'Payment gateway rejected the request',
          502,
          'GATEWAY_REQUEST_ERROR'
        );
    }
  }
}