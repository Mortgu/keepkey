import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});
