import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    alwaysIncluded: z.boolean().optional(),
});

export const updateProductSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    alwaysIncluded: z.boolean().optional(),
});
