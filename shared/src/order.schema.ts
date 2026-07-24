import { z } from 'zod';

export const createOrderSchema = z.object({

});
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = createOrderSchema.partial();
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export const orderSchema = createOrderSchema.extend({
    id: z.string(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderListSchema = z.array(orderSchema);
export type OrderList = z.infer<typeof orderListSchema>;