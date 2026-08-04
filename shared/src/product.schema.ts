import { z } from "zod";
import { isoDateTime } from './common.js';
import { languageSchema } from "./language.schema.js";

export const productTranslationSchema = z.object({
    language: languageSchema,
    name: z.string().min(1),
    description: z.string().nullish().transform(v => (v === undefined) ? null : v),
    table: z.string().nullish().transform(v => (v === undefined) ? null : v),
});

export type ProductTranslationInput = z.infer<typeof productTranslationSchema>;

export const createProductSchema = z.object({
    translations: z.array(productTranslationSchema).min(2),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
    translations: z.array(productTranslationSchema).min(1),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productSchema = z.object({
    id: z.string(),
    translations: z.array(productTranslationSchema),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});

export type Product = z.infer<typeof productSchema>;

export const productListSchema = z.array(productSchema);

export type ProductList = z.infer<typeof productListSchema>;

export const workloadFilterSchema = z.object({
    search: z.string().optional(),
    sort: z.enum(["createdAt:asc", "createdAt:desc"]).optional(),
});
export type WorkloadFilterParams = z.input<typeof workloadFilterSchema>;
