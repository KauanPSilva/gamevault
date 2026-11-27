import { z } from 'zod';

export const loginSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email('Invalid email address')),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;