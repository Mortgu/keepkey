import { z } from 'zod';
export declare const contractTranslationSchema: z.ZodObject<{
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    name: z.ZodString;
    features: z.ZodArray<z.ZodString>;
    table: z.ZodString;
}, z.core.$strip>;
export type ContractTranslationInput = z.infer<typeof contractTranslationSchema>;
export declare const createContractSchema: z.ZodObject<{
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        features: z.ZodArray<z.ZodString>;
        table: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export declare const updateContractSchema: z.ZodObject<{
    translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        features: z.ZodArray<z.ZodString>;
        table: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
/** Vollständige neue Reihenfolge aller Tarife; Index 0 ist der Standard. */
export declare const reorderContractsSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type ReorderContractsInput = z.infer<typeof reorderContractsSchema>;
export declare const contractSchema: z.ZodObject<{
    translations: z.ZodArray<z.ZodObject<{
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        name: z.ZodString;
        features: z.ZodArray<z.ZodString>;
        table: z.ZodString;
    }, z.core.$strip>>;
    id: z.ZodString;
    sortOrder: z.ZodInt;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Contract = z.infer<typeof contractSchema>;
//# sourceMappingURL=contract.schema.d.ts.map