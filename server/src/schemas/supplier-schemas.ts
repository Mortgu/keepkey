import z from "zod";

export const createSupplierSchema = z.object({
  supplierId: z.string().optional(),
  name: z.string().min(1),
});

export const updateSupplierSchema = z.object({
  supplierId: z.string().optional(),
  name: z.string().optional(),
});
