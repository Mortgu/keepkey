import { z } from "zod";

export const createFlatRateSchema = z.object({
    name: z.string().min(1),
    table: z.string().min(1),
    total_cents: z.number().int().nonnegative(),
    offerId: z.string().optional(),
});

export const updateFlatRateSchema = z.object({
    name: z.string().min(1).optional(),
    table: z.string().min(1).optional(),
    total_cents: z.number().int().nonnegative().optional(),
    offerId: z.string().optional().nullable(),
});
