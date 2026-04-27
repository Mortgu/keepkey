import { z } from "zod";

const orderPositionSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration_months: z.number().int().positive(),
    quantity: z.number().int().positive(),
    price: z.number().optional(),
});

export const createOrderSchema = z.array(orderPositionSchema).min(1);
