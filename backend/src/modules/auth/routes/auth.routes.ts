import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';

import {
  loginRateLimiter,
  registerRateLimiter,
} from '../../../middlewares/auth-rate-limit.middleware.js';

import {
  authenticate,
} from '../../../middlewares/auth.middleware.js';

const authRouter = Router();
const authController = new AuthController();

authRouter.post(
  '/register',
  registerRateLimiter,
  authController.register
);

authRouter.post(
  '/login',
  loginRateLimiter,
  authController.login
);

authRouter.get(
  '/me',
  authenticate,
  authController.me
);

export { authRouter };