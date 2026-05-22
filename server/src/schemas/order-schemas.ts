import { z } from "zod";

export const createOrderSchema = z.object({
  id: z.string().min(1),
});

const orderPositionSchema = z.object({
  productId: z.string().min(1),
  contractId: z.string().min(1),
  duration_months: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().optional(),
});

