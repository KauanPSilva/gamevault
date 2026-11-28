import { Router } from 'express';

import { authenticate } from '../../../middlewares/auth.middleware.js';

import { OrderController } from '../controllers/order.controller.js';

import { PaymentController } from '../../payments/controllers/payment.controller.js';

const orderController = new OrderController();

const paymentController = new PaymentController();

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post(
  '/',
  orderController.create,
);

orderRouter.get(
  '/',
  orderController.list,
);

orderRouter.get(
  '/:id',
  orderController.findById,
);

orderRouter.post(
  '/:id/payments',
  paymentController.create,
);