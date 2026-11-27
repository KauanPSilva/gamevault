import { z } from 'zod';

export const juntosSeFazPaymentSchema = z.object({
  id: z.string().min(1),

  type: z.literal('payments'),

  status: z.enum([
    'pending',
    'approved',
    'declined',
    'failed',
    'cancelled',
    'expired',
    'refunded',
  ]),

  environment: z.literal('staging'),

  simulated: z.literal(true),

  amount: z.number().finite().positive().optional(),

  currency: z.string().length(3).optional(),

  reference: z.string().optional(),

  pix_code: z.string().min(1).optional(),

  created_at: z.iso.datetime(),
});

export type JuntosSeFazPaymentResponse = z.infer<
  typeof juntosSeFazPaymentSchema
>;