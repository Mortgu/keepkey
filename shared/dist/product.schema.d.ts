import { z } from "zod";
export declare const productTranslationSchema: z.ZodObject<{
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    name: z.ZodString;
    description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
}, z.core.$strip>;
export type ProductTranslationInput = z.infer<typeof productTranslationSchema>;
export declare const createProductSchema: z.ZodObject<{
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
        table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export declare const updateProductSchema: z.ZodObject<{
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
        table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export declare const productSchema: z.ZodObject<{
    id: z.ZodString;
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
        table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    }, z.core.$strip>>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Product = z.infer<typeof productSchema>;
export declare const productListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
        table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    }, z.core.$strip>>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>>;
export type ProductList = z.infer<typeof productListSchema>;
export declare const workloadFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<{
        "createdAt:asc": "createdAt:asc";
        "createdAt:desc": "createdAt:desc";
    }>>;
}, z.core.$strip>;
export type WorkloadFilterParams = z.input<typeof workloadFilterSchema>;
//# sourceMappingURL=product.schema.d.ts.map