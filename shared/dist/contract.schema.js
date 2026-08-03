import { z } from 'zod';
import { isoDateTime } from './common.js';
import { languageSchema } from './language.schema.js';
export const contractTranslationSchema = z.object({
    language: languageSchema,
    name: z.string(),
    features: z.array(z.string()),
    table: z.string(),
});
export const createContractSchema = z.object({
    translations: z.array(contractTranslationSchema).min(1),
});
export const updateContractSchema = z.object({
    translations: z.array(contractTranslationSchema).optional(),
});
export const contractSchema = createContractSchema.extend({
    id: z.string(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
//# sourceMappingURL=contract.schema.js.map