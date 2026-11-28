export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export type PaymentMethod = 'pix';

export type SimulationAction =
  | 'approve'
  | 'decline'
  | 'cancel';

export interface PaymentGateway {
  code: string;
  name: string;
  description: string | null;
}

export interface Payment {
  id: string;
  externalId: string | null;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  failureReason: string | null;
  pixCode: string | null;
  simulated: boolean;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;

  gateway: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreatePaymentInput {
  gatewayCode: string;
  method: PaymentMethod;
  idempotencyKey: string;
}

export interface PaymentResponse {
  payment: Payment;
}

export interface PaymentGatewaysResponse {
  gateways: PaymentGateway[];
}

export interface GatewayPaymentStatus {
  paymentId: string;
  externalId: string;
  gatewayCode: string;
  localStatus: PaymentStatus;
  gatewayStatus: string;
  simulated: boolean;
  checkedAt: string;
}

export interface GatewayPaymentStatusResponse {
  status: GatewayPaymentStatus;
}