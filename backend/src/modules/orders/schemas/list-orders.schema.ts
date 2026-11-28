import { z } from 'zod';

export const listOrdersSchema = z.strictObject({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(
      z.number().int().min(1).max(10_000),
    )
    .prefault('1'),

  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(
      z.number().int().min(1).max(50),
    )
    .prefault('10'),
});

export type ListOrdersInput = z.infer<
  typeof listOrdersSchema
>;