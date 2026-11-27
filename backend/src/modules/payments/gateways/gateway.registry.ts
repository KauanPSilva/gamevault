import type {
  PaymentGateway,
} from './interfaces/payment-gateway.interface.js';

import { GatewayError } from './errors/gateway.error.js';

export class GatewayRegistry {
  private readonly gateways = new Map<string, PaymentGateway>();

  constructor(gateways: PaymentGateway[] = []) {
    for (const gateway of gateways) {
      this.register(gateway);
    }
  }

  register(gateway: PaymentGateway): void {
    if (this.gateways.has(gateway.code)) {
      throw new GatewayError(
        'Payment gateway already registered',
        500,
        'GATEWAY_ALREADY_REGISTERED'
      );
    }

    this.gateways.set(gateway.code, gateway);
  }

  get(code: string): PaymentGateway {
    const gateway = this.gateways.get(code);

    if (!gateway) {
      throw new GatewayError(
        'Payment gateway not supported',
        400,
        'GATEWAY_NOT_SUPPORTED'
      );
    }

    return gateway;
  }

  has(code: string): boolean {
    return this.gateways.has(code);
  }

  list(): Array<{ code: string; name: string }> {
    return Array.from(this.gateways.values()).map(
      (gateway) => ({
        code: gateway.code,
        name: gateway.name,
      })
    );
  }
}