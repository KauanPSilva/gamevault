import type { Request, Response } from 'express';

import { AppError } from '../../../errors/app.error.js';
import { AuthService } from '../services/auth.service.js';
import { registerSchema } from '../schemas/register.schema.js';
import { loginSchema } from '../schemas/login.schema.js';

export class AuthController {
  constructor(
    private readonly authService = new AuthService()
  ) {}

  register = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const input = registerSchema.parse(req.body);

    const result = await this.authService.register(input);

    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json(result);
  };

  login = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const input = loginSchema.parse(req.body);

    const result = await this.authService.login(input);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(result);
  };

  me = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'Authentication is required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    const user = await this.authService.getProfile(
      req.user.id
    );

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ user });
  };
}