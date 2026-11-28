import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'O e-mail deve ter até 254 caracteres.')
  .pipe(z.email('Informe um e-mail válido.'));

export const loginSchema = z.strictObject({
  email: emailSchema,

  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .max(128, 'A senha deve ter até 128 caracteres.'),
});

export const registerSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome deve ter até 100 caracteres.'),

  email: emailSchema,

  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(128, 'A senha deve ter até 128 caracteres.')
    .regex(/[a-z]/, 'Inclua uma letra minúscula.')
    .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
    .regex(/[0-9]/, 'Inclua pelo menos um número.'),

  confirmPassword: z
    .string()
    .min(1, 'Confirme sua senha.'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  },
);

export type LoginFormData = z.infer<typeof loginSchema>;

export type RegisterFormData = z.infer<typeof registerSchema>;