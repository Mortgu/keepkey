import { z } from "zod";
import { isoDateTime } from './common.js';
import { languageSchema } from "./language.schema.js";
export const productTranslationSchema = z.object({
    language: languageSchema,
    name: z.string().min(1),
    description: z.string().nullish().transform(v => (v === undefined) ? null : v),
    table: z.string().nullish().transform(v => (v === undefined) ? null : v),
});
export const createProductSchema = z.object({
    translations: z.array(productTranslationSchema).min(2),
});
export const updateProductSchema = z.object({
    translations: z.array(productTranslationSchema).min(1),
});
export const productSchema = z.object({
    id: z.string(),
    translations: z.array(productTranslationSchema),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const productListSchema = z.array(productSchema);
export const workloadFilterSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
//# sourceMappingURL=product.schema.js.map