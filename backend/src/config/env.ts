import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000),

  FRONTEND_URL: z
    .url()
    .default('http://localhost:5173'),

  DATABASE_URL: z.url(),

  JUNTOS_SE_FAZ_BASE_URL: z.url().default(
    'https://www.juntosefaz.com.br/gateway/api/v1'
  ),

  JUNTOS_SE_FAZ_API_TOKEN: z.string().trim().min(1).optional(),

  JUNTOS_SE_FAZ_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(30000)
    .default(10000),

  JWT_SECRET: z.string().regex(
    /^[a-fA-F0-9]{64}$/,
    'JWT_SECRET must contain 64 hexadecimal characters'
  ),

  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .min(300)
    .max(86400)
    .default(3600),
});



export const env = envSchema.parse(process.env);