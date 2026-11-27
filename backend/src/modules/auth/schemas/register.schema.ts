import { z } from 'zod';

export const registerSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(3, 'Name must contain at least 3 characters')
    .max(100, 'Name must contain at most 100 characters'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email('Invalid email address')),

  password: z   
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(128, 'Password must contain at most 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;