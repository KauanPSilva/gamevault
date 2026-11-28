import { AppError } from '../../../errors/app.error.js';
import { gatewayRegistry } from '../../payments/gateways/index.js';
import { AdminGatewayRepository } from '../repositories/admin-gateway.repository.js';
import type { UpdateGatewayStatusInput } from '../schemas/admin-gateway.schema.js';

export class AdminGatewayService {
  constructor(
    private readonly repository = new AdminGatewayRepository(),
  ) {}

  async listGateways() {
    const gateways = await this.repository.findAll();

    return {
      gateways: gateways.map((gateway) => ({
        ...gateway,
        isImplemented: gatewayRegistry.has(gateway.code),
        environment: 'sandbox',
      })),
    };
  }

  async updateGatewayStatus(
    id: string,
    input: UpdateGatewayStatusInput,
  ) {
    const gateway = await this.repository.findById(id);

    if (!gateway) {
      throw new AppError(
        'Payment gateway not found',
        404,
        'GATEWAY_NOT_FOUND',
      );
    }

    const isImplemented = gatewayRegistry.has(gateway.code);

    if (input.isActive && !isImplemented) {
      throw new AppError(
        'Payment gateway integration is not implemented',
        400,
        'GATEWAY_NOT_IMPLEMENTED',
      );
    }

    const updatedGateway =
      gateway.isActive === input.isActive
        ? gateway
        : await this.repository.updateStatus(
            id,
            input.isActive,
          );

    return {
      gateway: {
        ...updatedGateway,
        isImplemented,
        environment: 'sandbox',
      },
    };
  }
}