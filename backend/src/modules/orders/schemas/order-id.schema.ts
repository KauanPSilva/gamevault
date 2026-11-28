import { z } from 'zod';

export const orderIdSchema = z.strictObject({
  id: z.uuid(),
});

export type OrderIdInput = z.infer<
  typeof orderIdSchema
>;