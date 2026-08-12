import type {
    DocumentCapabilities,
    DocumentFormatParam,
    DocumentType,
    GeneratedDocument,
} from "@keepit/schemas";
import { BASE_URL, api } from "@/lib/api-client";

/** Was diese Umgebung beim Ersetzen erzeugter Dateien hergibt. */
export const fetchDocumentCapabilities = () =>
    api<DocumentCapabilities>("/api/documents/capabilities");

export const renameDocument = (type: DocumentType, documentId: string, displayName: string) =>
    api<GeneratedDocument>(`/api/documents/${type}/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify({ displayName }),
    });

export const deleteDocument = (type: DocumentType, documentId: string) =>
    api<void>(`/api/documents/${type}/${documentId}`, { method: "DELETE" });

export const uploadDocument = (type: DocumentType, documentId: string) =>
    api<void>(`/api/documents/${type}/${documentId}/upload`, { method: "POST" });

export const documentDownloadUrl = (type: DocumentType, documentId: string, format: DocumentFormatParam) =>
    `${BASE_URL}/api/documents/${type}/${documentId}/artifacts/${format}`;

/* ───────────────────────────────
   Erzeugte Datei ersetzen

   Dreischrittig, weil S3 dem Server den Abschluss nicht meldet: URL anfordern,
   direkt hochladen, bestätigen.
   ─────────────────────────────── */

type ReplacementUpload = {
    url: string;
    objectKey: string;
    contentType: string;
};

export const requestReplacementUpload = (
    type: DocumentType,
    documentId: string,
    format: DocumentFormatParam,
) =>
    api<ReplacementUpload>(
        `/api/documents/${type}/${documentId}/artifacts/${format}/upload-url`,
        { method: "POST" },
    );

/**
 * Legt die Datei direkt in S3 ab.
 *
 * Bewusst mit rohem `fetch` statt über `api`: dort hängen `credentials: "include"`
 * und `BASE_URL` dran — beides hat bei einer fremden Origin nichts zu suchen und
 * würde den Preflight unnötig verschärfen.
 *
 * Der `Content-Type` muss exakt dem entsprechen, mit dem die URL signiert wurde,
 * sonst weist S3 den PUT ab.
 */
export const putReplacementFile = async (upload: ReplacementUpload, file: File): Promise<void> => {
    if (!/^https?:$/.test(new URL(upload.url).protocol)) {
        throw new Error("Der Objektspeicher ist aus dem Browser nicht erreichbar.");
    }

    let response: Response;
    try {
        response = await fetch(upload.url, {
            method: "PUT",
            headers: { "Content-Type": upload.contentType },
            body: file,
        });
    } catch {
        // Ein CORS-Abbruch kommt ohne Status hier an, und zwar auch dann, wenn
        // der PUT im Bucket längst durchgelaufen ist — der Browser gibt die
        // Antwort nur nicht heraus. Ohne diese Übersetzung stünde da bloß
        // "Failed to fetch".
        throw new Error(
            "Der Bucket nimmt keine Uploads von dieser Domain an — es fehlt eine CORS-Regel.",
        );
    }

    if (!response.ok) {
        throw new Error(`Upload nach S3 fehlgeschlagen (${response.status}).`);
    }
};

export const confirmReplacementUpload = (
    type: DocumentType,
    documentId: string,
    format: DocumentFormatParam,
    objectKey: string,
) =>
    api<GeneratedDocument>(
        `/api/documents/${type}/${documentId}/artifacts/${format}/replace`,
        { method: "POST", body: JSON.stringify({ objectKey }) },
    );

/** Überträgt den ersetzten Stand erneut nach Nextcloud. */
export const resyncDocument = (type: DocumentType, documentId: string) =>
    api<void>(`/api/documents/${type}/${documentId}/resync`, { method: "POST" });