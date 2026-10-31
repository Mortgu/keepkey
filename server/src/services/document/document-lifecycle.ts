import { DocumentStatus, type DocumentFormat } from "@prisma/client";
import { artifactPair, findArtifact } from "../../lib/document-artifacts.js";
import {
    MIME_TYPES,
    getDocumentDownloadUrl,
    removeDocumentArtifacts,
    toDocumentFormat,
} from "../../lib/document-artifact-store.js";
import { AppException } from "../../lib/exceptions.js";
import {
    RemoteDocumentExistsError,
    deleteDocumentArtifact,
    moveDocumentArtifact,
} from "../../lib/nextcloud-document-store.js";
import { prisma } from "../../lib/prismaClient.js";
import logger from "@/utils/logger.js";
import type { DocumentFormatParam, DocumentType } from "@keepit/schemas";
import { uploadGeneratedDocument } from "./document-upload.service.js";
import { documentTable } from "./document-repo.js";

export type RenameDocumentInput = { displayName: string };

const DOWNLOADABLE_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADING,
    DocumentStatus.UPLOADED,
]);
const RENAMABLE_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADED,
]);

/** Solange eine dieser Phasen läuft, greift bereits jemand anderes auf das Dokument zu. */
const BUSY_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.PENDING,
    DocumentStatus.PROCESSING,
    DocumentStatus.UPLOADING,
]);

/** Artefakt, das bereits auf Nextcloud liegt. */
type UploadedArtifact = { id: string; remotePath: string };

/** Räumt beide Remote-Dateien eines Dokuments ab Nextcloud weg, sofern dort noch etwas liegt. */
async function clearRemoteArtifacts(
    pdf: { remotePath: string | null } | null,
    docx: { remotePath: string | null } | null,
): Promise<void> {
    for (const artifact of [pdf, docx]) {
        if (artifact?.remotePath) {
            await deleteDocumentArtifact(artifact.remotePath);
        }
    }
}

/** Die IDs zweier optionaler Artefakte, ohne die fehlenden. */
function artifactIds(pdf: { id: string } | null, docx: { id: string } | null): string[] {
    return [pdf?.id, docx?.id].filter((value): value is string => Boolean(value));
}

/** Die Artefakte eines Dokuments, sofern beide hochgeladen sind. */
function uploadedPair(artifacts: Array<{ id: string; format: DocumentFormat; remotePath: string | null }>) {
    const { pdf, docx } = artifactPair(artifacts);
    if (!pdf?.remotePath || !docx?.remotePath) return null;

    return {
        pdf: { id: pdf.id, remotePath: pdf.remotePath } satisfies UploadedArtifact,
        docx: { id: docx.id, remotePath: docx.remotePath } satisfies UploadedArtifact,
    };
}

/**
 * Verschiebt beide Dateien eines Dokuments auf den neuen Namen.
 *
 * Scheitert die zweite Verschiebung, wird die erste zurückgenommen — sonst
 * bliebe ein halb umbenanntes Paar zurück, das weder zum alten noch zum neuen
 * Namen passt. Scheitert auch das Zurücknehmen, wird der Zustand protokolliert
 * und gemeldet, statt ihn stillschweigend zu hinterlassen.
 */
async function moveUploadedPair(
    uploaded: { pdf: UploadedArtifact; docx: UploadedArtifact },
    displayName: string,
): Promise<{ pdf: string; docx: string }> {
    const pdfPath = await moveDocumentArtifact(uploaded.pdf.remotePath, `${displayName}.pdf`);

    try {
        const docxPath = await moveDocumentArtifact(uploaded.docx.remotePath, `${displayName}.docx`);
        return { pdf: pdfPath, docx: docxPath };
    } catch (error) {
        try {
            await moveDocumentArtifact(pdfPath, uploaded.pdf.remotePath.split("/").pop()!);
        } catch (rollbackError) {
            logger.error('document_rename_rollback_failed', {
                movedTo: pdfPath,
                expectedAt: uploaded.pdf.remotePath,
                error: (rollbackError as Error).message,
            });
            throw new AppException(
                `Das Umbenennen ist fehlgeschlagen und konnte nicht zurückgenommen werden. `
                + `Die PDF liegt jetzt unter ${pdfPath}.`,
                500,
                "DOCUMENT_RENAME_INCONSISTENT",
            );
        }
        throw error;
    }
}

/**
 * Benennt ein Dokument um — und zieht die Dateien auf Nextcloud mit.
 *
 * Reihenfolge mit Absicht: erst Nextcloud, dann die Datenbank. Fällt Nextcloud
 * aus, ändert sich gar nichts. Andersherum stünde in der Anwendung ein Name,
 * den die Datei nie bekommen hat.
 */
export async function renameDocument(
    type: DocumentType,
    id: string,
    input: RenameDocumentInput,
) {
    const document = await documentTable(type).requireWithArtifacts(id);
    await documentTable(type).assertEditable(id);

    if (!RENAMABLE_STATUSES.has(document.status)) {
        throw new AppException(
            "Only generated or uploaded documents can be renamed.",
            409,
            "DOCUMENT_NOT_RENAMABLE",
        );
    }

    // Vor dem Upload gibt es auf Nextcloud noch nichts zu verschieben.
    const uploaded = document.status === DocumentStatus.UPLOADED
        ? uploadedPair(document.artifacts)
        : null;

    let movedPaths: { pdf: string; docx: string } | null = null;
    if (uploaded) {
        try {
            movedPaths = await moveUploadedPair(uploaded, input.displayName);
        } catch (error) {
            if (error instanceof RemoteDocumentExistsError) {
                throw new AppException(
                    `Auf Nextcloud existiert bereits eine Datei unter ${error.remotePath}.`,
                    409,
                    "REMOTE_DOCUMENT_EXISTS",
                );
            }
            throw error;
        }
    }

    await prisma.$transaction(async (tx) => {
        const where = { id, deletedAt: null, status: { in: [...RENAMABLE_STATUSES] } };
        const data = { displayName: input.displayName };
        const renamed = await documentTable(type, tx).updateMany(where, data);

        if (renamed.count !== 1) {
            throw new AppException(
                "Only generated or uploaded documents can be renamed.",
                409,
                "DOCUMENT_NOT_RENAMABLE",
            );
        }

        if (uploaded && movedPaths) {
            await tx.documentArtifact.update({
                where: { id: uploaded.pdf.id },
                data: { remotePath: movedPaths.pdf },
            });
            await tx.documentArtifact.update({
                where: { id: uploaded.docx.id },
                data: { remotePath: movedPaths.docx },
            });
        }
    });

    return documentTable(type).requireWithArtifacts(id);
}

/**
 * Löscht ein Dokument und räumt seine Ablagen mit ab.
 *
 * Erst Nextcloud und S3, dann die Datenbank: Ist Nextcloud nicht erreichbar,
 * scheitert das Löschen und kann später wiederholt werden — besser als ein
 * Dokument, das aus der Anwendung verschwindet und dessen Datei danach niemand
 * mehr zuordnen kann.
 *
 * Der Soft-Delete leert zugleich die Upload-Spuren an den Artefakten. `remotePath`
 * ist global eindeutig; bliebe er stehen, könnte ein späteres Dokument mit
 * demselben Namen nie hochgeladen werden.
 */
export async function deleteDocument(type: DocumentType, id: string): Promise<void> {
    const document = await documentTable(type).requireWithArtifacts(id);
    await documentTable(type).assertEditable(id);

    if (BUSY_STATUSES.has(document.status)) {
        throw new AppException(
            "A document cannot be deleted while processing.",
            409,
            "DOCUMENT_PROCESSING",
        );
    }

    const { pdf, docx } = artifactPair(document.artifacts);

    await clearRemoteArtifacts(pdf, docx);

    // Die Objektschlüssel tragen eine Generierungs-UUID und werden nie erneut
    // vergeben — die Artefaktzeilen dürfen sie also behalten.
    if (pdf && docx) {
        await removeDocumentArtifacts({
            pdf: { objectKey: pdf.objectKey, size: pdf.size ?? 0, sha256: pdf.sha256 ?? "" },
            docx: { objectKey: docx.objectKey, size: docx.size ?? 0, sha256: docx.sha256 ?? "" },
        });
    }

    await prisma.$transaction(async (tx) => {
        const where = {
            id,
            deletedAt: null,
            status: { notIn: [...BUSY_STATUSES] },
        };
        const data = { deletedAt: new Date(), isCurrent: false };
        const deleted = await documentTable(type, tx).updateMany(where, data);

        if (deleted.count !== 1) {
            throw new AppException(
                "A document cannot be deleted while processing.",
                409,
                "DOCUMENT_PROCESSING",
            );
        }

        await tx.documentArtifact.updateMany({
            where: { id: { in: artifactIds(pdf, docx) } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null },
        });
    });
}

export async function downloadDocument(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
): Promise<{ url: string }> {
    const document = await documentTable(type).requireWithArtifacts(id);
    if (!DOWNLOADABLE_STATUSES.has(document.status)) {
        throw new AppException("Document not yet generated", 409, "DOCUMENTS_NOT_GENERATED");
    }

    const artifactFormat = toDocumentFormat(format);
    const artifact = findArtifact(document.artifacts, artifactFormat);
    if (!artifact) throw new AppException("File not found", 404, "FILE_NOT_FOUND");

    return {
        url: await getDocumentDownloadUrl(
            artifact.objectKey,
            `${document.displayName ?? document.id}.${format}`,
            MIME_TYPES[format],
        ),
    };
}

export function uploadDocument(type: DocumentType, id: string) {
    return uploadGeneratedDocument(type, id);
}

/**
 * Überträgt den aktuellen Stand erneut nach Nextcloud, nachdem die Datei
 * ersetzt wurde.
 *
 * Der reguläre Upload taugt dafür nicht: er kehrt bei Status `UPLOADED` sofort
 * zurück, und `uploadDocumentArtifact` weigert sich, abweichende Inhalte zu
 * überschreiben. Deshalb wird die Remote-Datei zuerst entfernt und der Status
 * zurückgesetzt — danach greift der gewöhnliche Upload samt seiner Lease-Logik
 * unverändert.
 */
export async function resyncDocument(type: DocumentType, id: string) {
    const document = await documentTable(type).requireWithArtifacts(id);

    if (document.status !== DocumentStatus.UPLOADED) {
        throw new AppException(
            "Nur bereits übertragene Dokumente können erneut übertragen werden.",
            409,
            "DOCUMENT_NOT_UPLOADED",
        );
    }

    const { pdf, docx } = artifactPair(document.artifacts);

    await clearRemoteArtifacts(pdf, docx);

    await prisma.$transaction(async (tx) => {
        const where = { id, deletedAt: null, status: DocumentStatus.UPLOADED };
        const data = { status: DocumentStatus.GENERATED };
        const reset = await documentTable(type, tx).updateMany(where, data);

        if (reset.count !== 1) {
            throw new AppException(
                "Das Dokument wurde zwischenzeitlich verändert.",
                409,
                "DOCUMENT_STATE_CHANGED",
            );
        }

        await tx.documentArtifact.updateMany({
            where: { id: { in: artifactIds(pdf, docx) } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null, remoteSha256: null },
        });
    });

    return uploadGeneratedDocument(type, id);
}
