import { z } from 'zod';

export const createPaymentSchema = z.strictObject({
  gatewayCode: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  method: z.literal('pix'),

  idempotencyKey: z.uuid(),
});

export type CreatePaymentInput = z.infer<
  typeof createPaymentSchema
>;