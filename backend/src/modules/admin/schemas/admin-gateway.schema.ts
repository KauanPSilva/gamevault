import { z } from 'zod';

export const adminGatewayIdSchema = z.strictObject({
  id: z.uuid(),
});

export const updateGatewayStatusSchema = z.strictObject({
  isActive: z.boolean(),
});

export type UpdateGatewayStatusInput = z.infer<
  typeof updateGatewayStatusSchema
>;