import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import {
    removeDocumentArtifacts,
    StoredDocumentArtifacts,
} from "../lib/document-artifact-store.js";
import { artifactPair } from "../lib/document-artifacts.js";
import { PipelineContext, PipelineStageError } from "../pipelines/pipeline.js";
import logger from "@/utils/logger.js";

/**
 * Bausteine, die jede Dokument-Generierung (Offer, Order, …) gleich benutzt.
 * Bewusst nur reine Helfer ohne Bezug zu einer bestimmten Dokumenttabelle —
 * der Ablauf je Typ steht ausgeschrieben in seiner eigenen Funktion.
 */

export type GeneratedDocument = {
    displayName: string;
    docxBuffer: Buffer;
    pdfBuffer: Buffer;
};

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

export function getGeneratedDocument(context: PipelineContext): GeneratedDocument {
    if (!context.displayName || !context.docxBuffer || !context.pdfBuffer) {
        throw new PipelineStageError(
            "Pipeline completed without a display name, DOCX buffer, or PDF buffer.",
        );
    }

    return {
        displayName: context.displayName,
        docxBuffer: context.docxBuffer,
        pdfBuffer: context.pdfBuffer,
    };
}

export async function createArtifactDocuments(
    tx: Prisma.TransactionClient,
    files: StoredDocumentArtifacts,
    owner: { offerDocumentId: string } | { orderDocumentId: string } | { confirmationDocumentId: string },
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

