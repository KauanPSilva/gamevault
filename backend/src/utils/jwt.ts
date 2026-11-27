import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../errors/app.error.js';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(['CUSTOMER', 'ADMIN']),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type TokenPayload = z.infer<
  typeof tokenPayloadSchema
>;

interface GenerateTokenInput {
  id: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export function generateToken(
  user: GenerateTokenInput
): string {
  return jwt.sign(
    {
      role: user.role,
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      issuer: 'gamevault-api',
      audience: 'gamevault-client',
    }
  );
}

export function verifyToken(
  token: string
): TokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET,
      {
        algorithms: ['HS256'],
        issuer: 'gamevault-api',
        audience: 'gamevault-client',
      }
    );

    return tokenPayloadSchema.parse(decoded);
  } catch {
    throw new AppError(
      'Invalid or expired authentication token',
      401,
      'INVALID_TOKEN'
    );
  }
}