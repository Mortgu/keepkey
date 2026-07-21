import z from "zod";

export const documentTypeSchema = z.enum(["offer", "order"]);
export const documentFormatSchema = z.enum(["pdf", "docx"]);

export const documentParamsSchema = z.object({
    type: documentTypeSchema,
    documentId: z.string().min(1),
});

export const documentArtifactParamsSchema = documentParamsSchema.extend({
    format: documentFormatSchema,
});

export const renameDocumentSchema = z.object({
    displayName: z.string()
        .trim()
        .min(1, "displayName required!")
        .max(180, "displayName must not exceed 180 characters")
        .refine((value) => !/[\\/\u0000-\u001f\u007f]/.test(value), "displayName contains invalid characters"),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type DocumentFormatParam = z.infer<typeof documentFormatSchema>;
