import { z } from 'zod';
/** Format eines gespeicherten Artefakts — so steht es in der Datenbank. */
export const documentFormatSchema = z.enum(["PDF", "DOCX"]);
/**
 * Dasselbe Format als Pfadsegment in der Download-URL.
 *
 * Getrennt vom {@link documentFormatSchema}, weil es in der URL
 * kleingeschrieben ist. Beide Namen tragen den Unterschied, damit nicht das
 * eine dort landet, wo das andere erwartet wird.
 */
export const documentFormatParamSchema = z.enum(["pdf", "docx"]);
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
    remoteSha256: z.string().optional(),
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
/**
 * Warum das Ersetzen einer erzeugten Datei in dieser Umgebung nicht geht.
 *
 * Der Browser legt die Ersatzdatei direkt im Objektspeicher ab. Ist der dafür
 * signierte Endpunkt von aussen nicht erreichbar oder der Speicher gar nicht
 * ansprechbar, kann das nur fehlschlagen — dann bleibt die Funktion aus, statt
 * den Nutzer in einen Fehler laufen zu lassen.
 */
export const documentReplaceBlockerSchema = z.enum([
    /** Signiert wird auf einen internen Host (z. B. *.railway.internal). */
    "endpoint_private_network",
    /** Signiert wird auf localhost, obwohl der Server produktiv läuft. */
    "endpoint_loopback",
    /** Der Objektspeicher antwortet dem Server nicht. */
    "storage_unreachable",
    /** Der Bucket hat keine CORS-Regel, die ein PUT von dieser Origin erlaubt. */
    "cors_not_configured",
]);
export const documentCapabilitiesSchema = z.object({
    canReplaceFiles: z.boolean(),
    /** Nur gesetzt, wenn `canReplaceFiles` false ist. */
    blocker: documentReplaceBlockerSchema.optional(),
});
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
export const isRemoteOutdated = (artifact) => Boolean(artifact.remotePath) && artifact.remoteSha256 !== artifact.sha256;
/** true, wenn irgendein Artefakt des Dokuments von Nextcloud abweicht. */
export const hasOutdatedRemote = (artifacts) => artifacts.some(isRemoteOutdated);
//# sourceMappingURL=document.schema.js.map