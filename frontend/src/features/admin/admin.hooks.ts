import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { adminService } from './admin.service';
import { checkoutKeys } from '../checkout/checkout.hooks';
import { useAuth } from '../../hooks/useAuth';

import type {
  AdminGatewaysResponse,
  UpdateGatewayStatusInput,
} from '../../types/admin';

export const adminKeys = {
  all: ['admin'] as const,

  gateways: () =>
    [...adminKeys.all, 'gateways'] as const,
};

export function useAdminGateways() {
  const { isAuthenticated, isAdmin } = useAuth();

  return useQuery({
    queryKey: adminKeys.gateways(),

    queryFn: ({ signal }) =>
      adminService.getGateways(signal),

    enabled: isAuthenticated && isAdmin,

    staleTime: 0,
  });
}

interface UpdateGatewayStatusVariables {
  gatewayId: string;
  input: UpdateGatewayStatusInput;
}

export function useUpdateGatewayStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gatewayId,
      input,
    }: UpdateGatewayStatusVariables) =>
      adminService.updateGatewayStatus(
        gatewayId,
        input,
      ),

    retry: false,

    onSuccess: ({ gateway }) => {
      queryClient.setQueryData<AdminGatewaysResponse>(
        adminKeys.gateways(),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            gateways: current.gateways.map((item) =>
              item.id === gateway.id
                ? gateway
                : item,
            ),
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: adminKeys.gateways(),
      });

      void queryClient.invalidateQueries({
        queryKey: checkoutKeys.gateways(),
      });
    },
  });
}