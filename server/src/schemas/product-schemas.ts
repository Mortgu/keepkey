import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    link: z.string().url().optional(),
});

export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    link: z.string().url().optional(),
});
