import { z } from 'zod';

export const paymentIdSchema = z.strictObject({
  id: z.uuid(),
});

export type PaymentIdInput = z.infer<
  typeof paymentIdSchema
>;