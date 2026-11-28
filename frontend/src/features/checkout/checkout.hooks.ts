import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { checkoutService } from './checkout.service';

import type {
  CreateOrderInput,
} from '../../types/order';

import type {
  CreatePaymentInput,
  SimulationAction,
} from '../../types/payment';

export const checkoutKeys = {
  all: ['checkout'] as const,

  gateways: () =>
    [...checkoutKeys.all, 'gateways'] as const,

  orders: () =>
    [...checkoutKeys.all, 'orders'] as const,

  orderList: (page: number, limit: number) =>
    [...checkoutKeys.orders(), page, limit] as const,

  order: (orderId: string) =>
    [...checkoutKeys.all, 'order', orderId] as const,

  payment: (paymentId: string) =>
    [...checkoutKeys.all, 'payment', paymentId] as const,
};

export function usePaymentGateways() {
  return useQuery({
    queryKey: checkoutKeys.gateways(),

    queryFn: ({ signal }) =>
      checkoutService.getGateways(signal),
  });
}

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: checkoutKeys.orderList(page, limit),

    queryFn: ({ signal }) =>
      checkoutService.getOrders(page, limit, signal),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: checkoutKeys.order(orderId),

    queryFn: ({ signal }) =>
      checkoutService.getOrder(orderId, signal),

    enabled: Boolean(orderId),

    staleTime: 0,
  });
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: checkoutKeys.payment(paymentId),

    queryFn: ({ signal }) =>
      checkoutService.getPayment(paymentId, signal),

    enabled: Boolean(paymentId),

    staleTime: 0,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      checkoutService.createOrder(input),

    retry: false,

    onSuccess: ({ order }) => {
      queryClient.setQueryData(
        checkoutKeys.order(order.id),
        { order },
      );

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.orders(),
      });
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: CreatePaymentInput;
    }) =>
      checkoutService.createPayment(orderId, input),

    retry: false,

    onSuccess: ({ payment }) => {
      queryClient.setQueryData(
        checkoutKeys.payment(payment.id),
        { payment },
      );

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.order(payment.orderId),
      });

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.orders(),
      });
    },
  });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      action,
    }: {
      paymentId: string;
      action: SimulationAction;
    }) =>
      checkoutService.simulatePayment(
        paymentId,
        action,
      ),

    retry: false,

    onSuccess: ({ payment }) => {
      queryClient.setQueryData(
        checkoutKeys.payment(payment.id),
        { payment },
      );

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.order(payment.orderId),
      });

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.orders(),
      });

      if (payment.status === 'APPROVED') {
        void queryClient.invalidateQueries({
          queryKey: ['library'],
        });
      }
    },
  });
}

export function useCheckGatewayStatus() {
  return useMutation({
    mutationFn: (paymentId: string) =>
      checkoutService.getGatewayStatus(paymentId),

    retry: false,
  });
}