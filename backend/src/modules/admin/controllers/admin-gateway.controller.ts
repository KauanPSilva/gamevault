import type { Request, Response } from 'express';
import { AdminGatewayService } from '../services/admin-gateway.service.js';
import {
  adminGatewayIdSchema,
  updateGatewayStatusSchema,
} from '../schemas/admin-gateway.schema.js';

export class AdminGatewayController {
  constructor(
    private readonly service = new AdminGatewayService(),
  ) {}

  list = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const result = await this.service.listGateways();

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(result);
  };

  updateStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { id } = adminGatewayIdSchema.parse(req.params);

    const input = updateGatewayStatusSchema.parse(
      req.body,
    );

    const result = await this.service.updateGatewayStatus(
      id,
      input,
    );

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(result);
  };
}