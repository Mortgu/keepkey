import { z } from "zod";
import { isoDateTime } from './common.js';
import { languageSchema } from "./language.schema.js";
export const flatrateTranslationSchema = z.object({
    language: languageSchema,
    name: z.string(),
    table: z.string(),
});
export const createFlatrateSchema = z.object({
    translations: z.array(flatrateTranslationSchema).min(1),
    total_cents: z.number().int().positive(),
});
export const updateFlatrateSchema = createFlatrateSchema.partial();
export const flatrateSchema = z.object({
    id: z.string(),
    total_cents: z.number().int(),
    translations: z.array(flatrateTranslationSchema),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
//# sourceMappingURL=flatrate.schema.js.map