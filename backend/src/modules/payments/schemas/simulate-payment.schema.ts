import { z } from 'zod';

export const simulatePaymentSchema = z.strictObject({
  action: z.enum([
    'approve',
    'decline',
    'cancel',
  ]),
});

export type SimulatePaymentInput = z.infer<
  typeof simulatePaymentSchema
>;