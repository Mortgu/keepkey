import { z } from "zod";
export declare const flatrateTranslationSchema: z.ZodObject<{
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    name: z.ZodString;
    table: z.ZodString;
}, z.core.$strip>;
export type CreateFlatrateTranslationInput = z.infer<typeof flatrateTranslationSchema>;
export declare const createFlatrateSchema: z.ZodObject<{
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        table: z.ZodString;
    }, z.core.$strip>>;
    total_cents: z.ZodNumber;
}, z.core.$strip>;
export type CreateFlatrateInput = z.infer<typeof createFlatrateSchema>;
export declare const updateFlatrateSchema: z.ZodObject<{
    translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        table: z.ZodString;
    }, z.core.$strip>>>;
    total_cents: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateFlatrateInput = z.infer<typeof updateFlatrateSchema>;
export declare const flatrateSchema: z.ZodObject<{
    id: z.ZodString;
    total_cents: z.ZodNumber;
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        table: z.ZodString;
    }, z.core.$strip>>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Flatrate = z.infer<typeof flatrateSchema>;
//# sourceMappingURL=flatrate.schema.d.ts.map