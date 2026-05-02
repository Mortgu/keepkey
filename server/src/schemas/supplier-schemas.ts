import { z } from "zod";

export const createSupplierSchema = z.object({
  supplierId: z.string().min(1),
  name: z.string().min(1),
});
