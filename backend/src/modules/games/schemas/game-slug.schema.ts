import { z } from 'zod';

export const gameSlugSchema = z.strictObject({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Invalid game slug',
    ),
});

export type GameSlugInput = z.infer<typeof gameSlugSchema>;