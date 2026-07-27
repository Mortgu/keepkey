import { z } from 'zod';
export const documentFormatSchema = z.enum(["PDF", "DOCX"]);
export const documentStatusSchema = z.enum([
    "PENDING", "PROCESSING", "GENERATED", "UPLOADING", "UPLOADED", "FAILED"
]);
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
export const documentTypeSchema = z.enum(["offer", "order"]);
export const generatedDocumentSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),
    status: documentStatusSchema,
    artifacts: z.array(documentArtifactSchema),
});
export const findDocumentArtifact = (artifacts, format) => artifacts.find((artifact) => artifact.format === format);
//# sourceMappingURL=document.schema.js.map