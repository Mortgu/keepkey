import { z } from "zod";
import { isoDateTime } from './common.js';
import { languageSchema } from "./language.schema.js";

export const flatrateTranslationSchema = z.object({
    language: languageSchema,
    name: z.string(),
    table: z.string(),
});

export type CreateFlatrateTranslationInput = z.infer<typeof flatrateTranslationSchema>;

export const createFlatrateSchema = z.object({
    translations: z.array(flatrateTranslationSchema).min(1),
    total_cents: z.number().int().positive(),
});

export type CreateFlatrateInput = z.infer<typeof createFlatrateSchema>;

export const updateFlatrateSchema = createFlatrateSchema.partial();

export type UpdateFlatrateInput = z.infer<typeof updateFlatrateSchema>;

export const flatrateSchema = z.object({
    id: z.string(),

    total_cents: z.number().int(),
    translations: z.array(flatrateTranslationSchema),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});

export type Flatrate = z.infer<typeof flatrateSchema>;