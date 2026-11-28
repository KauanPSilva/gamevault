import type { PaymentStatus } from './payment';

import type { Pagination } from './game';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED';

export interface OrderItem {
  id: string;
  unitPrice: number;

  game: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
    accentColor: string;
  };
}

export interface OrderPayment {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;

  gateway: {
    name: string;
    code: string;
  };
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface CreateOrderInput {
  gameIds: string[];
}

export interface OrderResponse {
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}