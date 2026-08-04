import { z } from 'zod';
/** Format eines gespeicherten Artefakts — so steht es in der Datenbank. */
export declare const documentFormatSchema: z.ZodEnum<{
    PDF: "PDF";
    DOCX: "DOCX";
}>;
export type DocumentFormat = z.infer<typeof documentFormatSchema>;
/**
 * Dasselbe Format als Pfadsegment in der Download-URL.
 *
 * Getrennt vom {@link documentFormatSchema}, weil es in der URL
 * kleingeschrieben ist. Beide Namen tragen den Unterschied, damit nicht das
 * eine dort landet, wo das andere erwartet wird.
 */
export declare const documentFormatParamSchema: z.ZodEnum<{
    pdf: "pdf";
    docx: "docx";
}>;
export type DocumentFormatParam = z.infer<typeof documentFormatParamSchema>;
export declare const documentStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    PROCESSING: "PROCESSING";
    GENERATED: "GENERATED";
    UPLOADING: "UPLOADING";
    UPLOADED: "UPLOADED";
    FAILED: "FAILED";
}>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export declare const documentArtifactSchema: z.ZodObject<{
    id: z.ZodString;
    objectKey: z.ZodString;
    format: z.ZodEnum<{
        PDF: "PDF";
        DOCX: "DOCX";
    }>;
    size: z.ZodOptional<z.ZodNumber>;
    sha256: z.ZodOptional<z.ZodString>;
    uploadedAt: z.ZodOptional<z.ZodString>;
    remotePath: z.ZodOptional<z.ZodString>;
    remoteEtag: z.ZodOptional<z.ZodString>;
    offerDocumentId: z.ZodOptional<z.ZodString>;
    orderDocumentId: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type DocumentArtifact = z.infer<typeof documentArtifactSchema>;
export declare const documentTypeSchema: z.ZodEnum<{
    offer: "offer";
    order: "order";
}>;
export type DocumentType = z.infer<typeof documentTypeSchema>;
export declare const generatedDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        GENERATED: "GENERATED";
        UPLOADING: "UPLOADING";
        UPLOADED: "UPLOADED";
        FAILED: "FAILED";
    }>;
    artifacts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        objectKey: z.ZodString;
        format: z.ZodEnum<{
            PDF: "PDF";
            DOCX: "DOCX";
        }>;
        size: z.ZodOptional<z.ZodNumber>;
        sha256: z.ZodOptional<z.ZodString>;
        uploadedAt: z.ZodOptional<z.ZodString>;
        remotePath: z.ZodOptional<z.ZodString>;
        remoteEtag: z.ZodOptional<z.ZodString>;
        offerDocumentId: z.ZodOptional<z.ZodString>;
        orderDocumentId: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GeneratedDocument = z.infer<typeof generatedDocumentSchema>;
export declare const findDocumentArtifact: (artifacts: Array<DocumentArtifact>, format: DocumentFormat) => {
    id: string;
    objectKey: string;
    format: "PDF" | "DOCX";
    updatedAt: string;
    createdAt: string;
    size?: number | undefined;
    sha256?: string | undefined;
    uploadedAt?: string | undefined;
    remotePath?: string | undefined;
    remoteEtag?: string | undefined;
    offerDocumentId?: string | undefined;
    orderDocumentId?: string | undefined;
} | undefined;
//# sourceMappingURL=document.schema.d.ts.map