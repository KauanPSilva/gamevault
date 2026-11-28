import { api } from '../../services/api';

import type {
  CreateOrderInput,
  OrderResponse,
  OrdersResponse,
} from '../../types/order';

import type {
  CreatePaymentInput,
  PaymentResponse,
  PaymentGatewaysResponse,
  GatewayPaymentStatusResponse,
  SimulationAction,
} from '../../types/payment';

export const checkoutService = {
  async getGateways(signal?: AbortSignal) {
    const { data } =
      await api.get<PaymentGatewaysResponse>(
        '/payment-gateways',
        { signal },
      );

    return data;
  },

  async createOrder(input: CreateOrderInput) {
    const { data } = await api.post<OrderResponse>(
      '/orders',
      input,
    );

    return data;
  },

  async getOrder(
    orderId: string,
    signal?: AbortSignal,
  ) {
    const { data } = await api.get<OrderResponse>(
      `/orders/${encodeURIComponent(orderId)}`,
      { signal },
    );

    return data;
  },

  async getOrders(
    page = 1,
    limit = 10,
    signal?: AbortSignal,
  ) {
    const { data } = await api.get<OrdersResponse>(
      '/orders',
      {
        params: { page, limit },
        signal,
      },
    );

    return data;
  },

  async createPayment(
    orderId: string,
    input: CreatePaymentInput,
  ) {
    const { data } = await api.post<PaymentResponse>(
      `/orders/${encodeURIComponent(orderId)}/payments`,
      input,
    );

    return data;
  },

  async getPayment(
    paymentId: string,
    signal?: AbortSignal,
  ) {
    const { data } = await api.get<PaymentResponse>(
      `/payments/${encodeURIComponent(paymentId)}`,
      { signal },
    );

    return data;
  },

  async simulatePayment(
    paymentId: string,
    action: SimulationAction,
  ) {
    const { data } = await api.post<PaymentResponse>(
      `/payments/${encodeURIComponent(paymentId)}/simulate`,
      { action },
    );

    return data;
  },

  async getGatewayStatus(
    paymentId: string,
    signal?: AbortSignal,
  ) {
    const { data } =
      await api.get<GatewayPaymentStatusResponse>(
        `/payments/${encodeURIComponent(paymentId)}/gateway-status`,
        { signal },
      );

    return data;
  },
};