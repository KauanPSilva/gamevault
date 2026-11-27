export type GatewayPaymentStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'declined'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export type PaymentMethod = 'pix';

export interface CreatePaymentInput {
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  method: PaymentMethod;
}

export interface GatewayPaymentResult {
  externalId: string;
  status: GatewayPaymentStatus;
  amount?: number;
  currency?: string;
  reference?: string;
  pixCode?: string;
  simulated: boolean;
}

export interface PaymentGateway {
  readonly code: string;
  readonly name: string;

  createPayment(
    input: CreatePaymentInput
  ): Promise<GatewayPaymentResult>;

  getPayment(
    externalId: string
  ): Promise<GatewayPaymentResult>;
}