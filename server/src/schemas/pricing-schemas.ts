import { z } from "zod";

export const createPricingSchema = z.object({
  contractId: z.string().min(1),
  min_quantity: z.number().int().nonnegative(),
  max_quantity: z.number().int().nonnegative().optional(),
  duration_months: z.number().int().positive().optional(),
  price: z.number().int().nonnegative(),
});
