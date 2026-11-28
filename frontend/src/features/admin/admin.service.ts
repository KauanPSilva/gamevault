import { api } from '../../services/api';
import type {
  AdminGatewaysResponse,
  AdminGatewayResponse,
  UpdateGatewayStatusInput,
} from '../../types/admin';

export const adminService = {
  async getGateways(
    signal?: AbortSignal,
  ): Promise<AdminGatewaysResponse> {
    const { data } = await api.get<AdminGatewaysResponse>(
      '/admin/payment-gateways',
      { signal },
    );

    return data;
  },

  async updateGatewayStatus(
    gatewayId: string,
    input: UpdateGatewayStatusInput,
  ): Promise<AdminGatewayResponse> {
    const { data } = await api.patch<AdminGatewayResponse>(
      `/admin/payment-gateways/${encodeURIComponent(gatewayId)}`,
      input,
    );

    return data;
  },
};