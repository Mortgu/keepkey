import { z } from "zod";

import { documentFormatParamSchema, documentTypeSchema } from "@keepit/schemas";

/**
 * Route-Parameter der Dokument-Endpunkte. Die Bausteine `documentTypeSchema`
 * und `documentFormatParamSchema` gehören zum API-Vertrag und liegen deshalb
 * in `@keepit/schemas` — hier steht nur, wie sie sich zu einem Pfad fügen.
 */
export const documentParamsSchema = z.object({
    type: documentTypeSchema,
    documentId: z.string().min(1),
});

export const documentArtifactParamsSchema = documentParamsSchema.extend({
    format: documentFormatParamSchema,
});

export const renameDocumentSchema = z.object({
    displayName: z.string()
        .trim()
        .min(1, "displayName required!")
        .max(180, "displayName must not exceed 180 characters")
        .refine((value) => !/[\\/\u0000-\u001f\u007f]/.test(value), "displayName contains invalid characters"),
});

