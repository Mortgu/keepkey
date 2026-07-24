import { z } from 'zod';

export const documentFormatSchema = z.enum(["PDF", "DOCX"]);
export type DocumentFormat = z.infer<typeof documentFormatSchema>;

export const documentStatusSchema = z.enum([
    "PENDING", "PROCESSING", "GENERATED", "UPLOADING", "UPLOADED", "FAILED"
]);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const documentArtifactSchema = z.object({
    id: z.string(),
    objectKey: z.string(),
    format: documentFormatSchema,

    size: z.number().optional(),
    sha256: z.string().optional(),

    uploadedAt: z.string().optional(),
    remotePath: z.string().optional(),
    remoteEtag: z.string().optional(),

    offerDocumentId: z.string().optional(),
    orderDocumentId: z.string().optional(),

    updatedAt: z.string(),
    createdAt: z.string(),
});
export type DocumentArtifact = z.infer<typeof documentArtifactSchema>;
