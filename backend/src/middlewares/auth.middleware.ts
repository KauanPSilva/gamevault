import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { AppError } from '../errors/app.error.js';
import { verifyToken } from '../utils/jwt.js';

import {
  UserRepository,
} from '../modules/users/repositories/user.repository.js';

const userRepository = new UserRepository();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError(
      'Authentication is required',
      401,
      'AUTHENTICATION_REQUIRED'
    );
  }

  const [scheme, token, ...extra] =
    authorization.trim().split(/\s+/);

  if (
    scheme?.toLowerCase() !== 'bearer' ||
    !token ||
    extra.length > 0
  ) {
    throw new AppError(
      'Invalid authorization header',
      401,
      'INVALID_AUTHORIZATION_HEADER'
    );
  }

  const payload = verifyToken(token);

  const user = await userRepository.findById(
    payload.sub
  );

  if (!user) {
    throw new AppError(
      'Invalid authentication token',
      401,
      'INVALID_TOKEN'
    );
  }

  req.user = {
    id: user.id,
    role: user.role,
  };

  next();
}