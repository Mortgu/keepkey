import { z } from "zod";

export const createContractSchema = z.object({
  name: z.string().min(1),
  features: z.array(z.string()).optional(),
});

export const updateContractSchema = z.object({
  name: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
});
