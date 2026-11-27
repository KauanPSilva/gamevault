import type { RequestHandler } from 'express';

import { AppError } from '../errors/app.error.js';

type UserRole = 'CUSTOMER' | 'ADMIN';

export function authorize(
  ...allowedRoles: UserRole[]
): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError(
        'Authentication is required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to access this resource',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}