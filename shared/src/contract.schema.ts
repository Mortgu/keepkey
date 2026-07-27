import { z } from 'zod';
import { isoDateTime } from './common.js';
import { languageSchema } from './language.schema.js';

export const contractTranslationSchema = z.object({
    language: languageSchema,
    name: z.string(),
    features: z.array(z.string()),
    table: z.string(),
});
export type ContractTranslationInput = z.infer<typeof contractTranslationSchema>;

export const createContractSchema = z.object({
    translations: z.array(contractTranslationSchema).min(1),
});
export type CreateContractInput = z.infer<typeof createContractSchema>;

export const updateContractSchema = createContractSchema.partial();
export type UpdateContractInput = z.infer<typeof updateContractSchema>;

export const contractSchema = createContractSchema.extend({
    id: z.string(),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type Contract = z.infer<typeof contractSchema>;