import { z } from "zod";

export const createOrderSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1, "Bestell-Nr. erforderlich"),
  date: z.string().optional(),
  projectNumber: z.string().optional(),
  projectDescription: z.string().optional(),
  orderDetails: z.string().optional(),
});
