import { z } from 'zod';

export const listGamesSchema = z.strictObject({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  category: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),

  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),

  sort: z
    .enum([
      'title_asc',
      'title_desc',
      'price_asc',
      'price_desc',
      'newest',
    ])
    .default('newest'),

  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(10000))
    .prefault('1'),

  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .prefault('12'),
});

export type ListGamesInput = z.infer<typeof listGamesSchema>;