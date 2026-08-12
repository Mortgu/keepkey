import { z } from 'zod';

/** Format eines gespeicherten Artefakts — so steht es in der Datenbank. */
export const documentFormatSchema = z.enum(["PDF", "DOCX"]);
export type DocumentFormat = z.infer<typeof documentFormatSchema>;

/**
 * Dasselbe Format als Pfadsegment in der Download-URL.
 *
 * Getrennt vom {@link documentFormatSchema}, weil es in der URL
 * kleingeschrieben ist. Beide Namen tragen den Unterschied, damit nicht das
 * eine dort landet, wo das andere erwartet wird.
 */
export const documentFormatParamSchema = z.enum(["pdf", "docx"]);
export type DocumentFormatParam = z.infer<typeof documentFormatParamSchema>;

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
    remoteSha256: z.string().optional(),

    offerDocumentId: z.string().optional(),
    orderDocumentId: z.string().optional(),

    updatedAt: z.string(),
    createdAt: z.string(),
});
export type DocumentArtifact = z.infer<typeof documentArtifactSchema>;

export const documentTypeSchema = z.enum(["offer", "order"]);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const generatedDocumentSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),
    status: documentStatusSchema,
    artifacts: z.array(documentArtifactSchema),
});
export type GeneratedDocument = z.infer<typeof generatedDocumentSchema>;

export const findDocumentArtifact = (
    artifacts: Array<DocumentArtifact>,
    format: DocumentFormat,
) => artifacts.find((artifact) => artifact.format === format);

/**
 * true, wenn die Datei auf Nextcloud nicht mehr dem Stand in S3 entspricht.
 *
 * Das passiert, wenn jemand die erzeugte Datei nach dem Synchronisieren ersetzt
 * hat. Nextcloud wird dabei bewusst nicht automatisch nachgezogen — der Nutzer
 * soll sehen, dass die Stände auseinanderlaufen, und selbst entscheiden.
 *
 * Ohne `remotePath` liegt noch nichts auf Nextcloud, dann gibt es auch nichts,
 * wovon abgewichen werden könnte.
 */
export const isRemoteOutdated = (artifact: DocumentArtifact): boolean =>
    Boolean(artifact.remotePath) && artifact.remoteSha256 !== artifact.sha256;

/** true, wenn irgendein Artefakt des Dokuments von Nextcloud abweicht. */
export const hasOutdatedRemote = (artifacts: Array<DocumentArtifact>): boolean =>
    artifacts.some(isRemoteOutdated);