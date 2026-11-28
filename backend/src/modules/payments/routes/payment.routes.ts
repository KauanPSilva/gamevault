import { Router } from 'express';

import { authenticate } from '../../../middlewares/auth.middleware.js';

import { PaymentController } from '../controllers/payment.controller.js';

const paymentController = new PaymentController();

export const paymentRouter = Router();

paymentRouter.use(authenticate);

paymentRouter.get(
  '/:id',
  paymentController.findById,
);

paymentRouter.get(
  '/:id/gateway-status',
  paymentController.findGatewayStatus,
);

paymentRouter.post(
  '/:id/simulate',
  paymentController.simulate,
);

export const paymentGatewayRouter = Router();

paymentGatewayRouter.use(authenticate);

paymentGatewayRouter.get(
  '/',
  paymentController.listGateways,
);