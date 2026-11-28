import { z } from 'zod';

export const createOrderSchema = z.strictObject({
  gameIds: z
    .array(z.uuid())
    .min(1)
    .max(50)
    .refine(
      (gameIds) =>
        new Set(gameIds).size === gameIds.length,
      {
        message: 'Duplicate games are not allowed',
      },
    ),
});

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;