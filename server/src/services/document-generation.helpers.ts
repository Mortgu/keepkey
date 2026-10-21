import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import {
    removeDocumentArtifacts,
    StoredDocumentArtifacts,
} from "../lib/document-artifact-store.js";
import { artifactPair } from "../lib/document-artifacts.js";
import logger from "@/utils/logger.js";

/**
 * Bausteine, die jede Dokument-Generierung (Offer, Order, …) gleich benutzt.
 * Bewusst nur reine Helfer ohne Bezug zu einer bestimmten Dokumenttabelle —
 * der Ablauf je Typ steht ausgeschrieben in seiner eigenen Funktion.
 */

const COMPLETED_DOCUMENT_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADING,
    DocumentStatus.UPLOADED,
]);

export function assertDocumentCanBeGenerated(
    document: { id: string; status: DocumentStatus; artifacts: { format: DocumentFormat }[] },
    type: string,
): boolean {
    const { pdf, docx } = artifactPair(document.artifacts);
    if (Boolean(pdf) !== Boolean(docx)) {
        throw new Error(`${type} ${document.id} has incomplete artifact links.`);
    }

    if (pdf && docx) {
        return false;
    }

    if (COMPLETED_DOCUMENT_STATUSES.has(document.status)) {
        throw new Error(`${type} ${document.id} is ${document.status} without complete artifact links.`);
    }

    return true;
}

export async function artifactsWereFinalized(
    files: StoredDocumentArtifacts,
    linkedFiles: () => Promise<{ artifacts: { objectKey: string; format: DocumentFormat }[] } | null>,
): Promise<boolean> {
    try {
        const linked = await linkedFiles();
        const linkedArtifacts = artifactPair(linked?.artifacts ?? []);
        if (linkedArtifacts.pdf?.objectKey === files.pdf.objectKey
            && linkedArtifacts.docx?.objectKey === files.docx.objectKey) {
            return true;
        }
    } catch (verificationError) {
        logger.error(verificationError);
        return false;
    }

    try {
        await removeDocumentArtifacts(files);
    } catch (cleanupError) {
        logger.error(cleanupError);
    }
    return false;
}

export async function createArtifactDocuments(
    tx: Prisma.TransactionClient,
    files: StoredDocumentArtifacts,
    owner: { documentId: string },
) {
    const pdf = await tx.documentArtifact.create({
        data: {
            ...files.pdf,
            format: DocumentFormat.PDF,
            ...owner,
        },
    });
    const docx = await tx.documentArtifact.create({
        data: {
            ...files.docx,
            format: DocumentFormat.DOCX,
            ...owner,
        },
    });

    return { pdf, docx };
}


/**
 * `Document` hat je Elterntyp eine nullbare FK-Spalte; welche gesetzt ist,
 * garantiert der CHECK `document_record_type_owner_check` anhand von `type`.
 * Engt die zum Typ passenden Felder auf nicht-`null` ein — ein `null` hier
 * hieße, der CHECK wurde umgangen.
 */
export function requireOwner<T extends { id: string }, K extends keyof T>(
    doc: T | null,
    ...keys: K[]
): (T & { [P in K]: NonNullable<T[P]> }) | null {
    if (!doc) return null;
    for (const key of keys) {
        if (doc[key] == null) {
            throw new Error(`Document ${doc.id} is missing its owner field "${String(key)}".`);
        }
    }
    return doc as T & { [P in K]: NonNullable<T[P]> };
}
