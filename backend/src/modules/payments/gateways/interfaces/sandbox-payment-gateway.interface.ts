import type {
  PaymentGateway,
  GatewayPaymentResult,
} from './payment-gateway.interface.js';

export interface SandboxPaymentGateway extends PaymentGateway {
  approvePayment(
    externalId: string
  ): Promise<GatewayPaymentResult>;

  declinePayment(
    externalId: string
  ): Promise<GatewayPaymentResult>;

  cancelPayment(
    externalId: string
  ): Promise<GatewayPaymentResult>;
}