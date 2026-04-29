import { z } from "zod";

export const flatRateSchema = z.object({
    name: z.string().min(1),
    table: z.string().min(1),
    total_cents: z.number().int().nonnegative(),
});

export const createFlatRateSchema = flatRateSchema;

export const updateFlatRateSchema = flatRateSchema;