import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { authorize } from '../../../middlewares/authorize.middleware.js';
import { AdminGatewayController } from '../controllers/admin-gateway.controller.js';

export const adminRouter = Router();

const adminGatewayController = new AdminGatewayController();

adminRouter.use(
  authenticate,
  authorize('ADMIN'),
);

adminRouter.get(
  '/payment-gateways',
  adminGatewayController.list,
);

adminRouter.patch(
  '/payment-gateways/:id',
  adminGatewayController.updateStatus,
);