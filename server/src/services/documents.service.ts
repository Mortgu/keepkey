import { randomUUID } from "node:crypto";
import { DocumentFormat, DocumentStatus } from "@prisma/client";
import { artifactPair, findArtifact } from "../lib/document-artifacts.js";
import {
    browserEndpointIssue,
    bucketAllowsBrowserUploads,
    getDocumentArtifact,
    getDocumentDownloadUrl,
    getDocumentUploadUrl,
    isS3Available,
    removeDocumentArtifact,
    removeDocumentArtifacts,
    type DocumentArtifactScope,
} from "../lib/document-artifact-store.js";
import { AppException } from "../lib/exceptions.js";
import {
    RemoteDocumentExistsError,
    deleteDocumentArtifact,
    moveDocumentArtifact,
    sha256Document,
} from "../lib/nextcloud-document-store.js";
import { prisma } from "../lib/prismaClient.js";
import logger from "@/utils/logger.js";
import type { DocumentCapabilities, DocumentFormatParam, DocumentType } from "@keepit/schemas";
import { uploadGeneratedDocument } from "./document-upload.service.js";

export type RenameDocumentInput = { displayName: string };

/** Kurz genug, dass eine gesetzte CORS-Regel zügig sichtbar wird. */
const CAPABILITIES_TTL_MS = 60_000;
let capabilitiesCache: { value: DocumentCapabilities; expiresAt: number } | null = null;

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
const MIME_TYPES: Record<DocumentFormatParam, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Ersetzen ist erlaubt, sobald es überhaupt ein Artefakt gibt. Bei `UPLOADED`
 * bleibt der Status stehen — es entsteht lediglich eine sichtbare Abweichung
 * zum Stand auf Nextcloud, die der Nutzer gezielt auflösen kann.
 */
const REPLACEABLE_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADED,
]);

/** Wie bei der Vorlagen-Route: mehr als das ist kein Angebotsdokument mehr. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const toDocumentFormat = (format: DocumentFormatParam): DocumentFormat =>
    format === "pdf" ? DocumentFormat.PDF : DocumentFormat.DOCX;

const scopeOf = (type: DocumentType): DocumentArtifactScope =>
    type === "offer" ? "offers" : "orders";

/**
 * Präfix, unter dem ersetzte Dateien liegen.
 *
 * Der Schlüssel wird immer serverseitig gebildet und beim Bestätigen gegen
 * dieses Präfix geprüft — ein vom Client frei gewählter Schlüssel könnte sonst
 * jedes beliebige Objekt im Bucket überschreiben.
 */
const replacementPrefix = (type: DocumentType, documentId: string) =>
    `replaced/${scopeOf(type)}/${documentId}/`;

async function findGeneratedDocument(type: DocumentType, id: string) {
    return type === "offer"
        ? prisma.offerDocument.findFirst({
            where: { id, deletedAt: null },
            include: { artifacts: true },
        })
        : prisma.orderDocument.findFirst({
            where: { id, deletedAt: null },
            include: { artifacts: true },
        });
}

async function requireGeneratedDocument(type: DocumentType, id: string) {
    const document = await findGeneratedDocument(type, id);
    if (!document) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }
    return document;
}

/** Artefakt, das bereits auf Nextcloud liegt. */
type UploadedArtifact = { id: string; remotePath: string };

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
    const document = await requireGeneratedDocument(type, id);

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
        const renamed = type === "offer"
            ? await tx.offerDocument.updateMany({ where, data })
            : await tx.orderDocument.updateMany({ where, data });

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

    return requireGeneratedDocument(type, id);
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
    const document = await requireGeneratedDocument(type, id);

    if (BUSY_STATUSES.has(document.status)) {
        throw new AppException(
            "A document cannot be deleted while processing.",
            409,
            "DOCUMENT_PROCESSING",
        );
    }

    const { pdf, docx } = artifactPair(document.artifacts);

    for (const artifact of [pdf, docx]) {
        if (artifact?.remotePath) {
            await deleteDocumentArtifact(artifact.remotePath);
        }
    }

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
        const deleted = type === "offer"
            ? await tx.offerDocument.updateMany({ where, data })
            : await tx.orderDocument.updateMany({ where, data });

        if (deleted.count !== 1) {
            throw new AppException(
                "A document cannot be deleted while processing.",
                409,
                "DOCUMENT_PROCESSING",
            );
        }

        await tx.documentArtifact.updateMany({
            where: { id: { in: [pdf?.id, docx?.id].filter((value): value is string => Boolean(value)) } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null },
        });
    });
}

export async function downloadDocument(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
): Promise<{ url: string }> {
    const document = await requireGeneratedDocument(type, id);
    if (!DOWNLOADABLE_STATUSES.has(document.status)) {
        throw new AppException("Document not yet generated", 409, "DOCUMENTS_NOT_GENERATED");
    }

    const artifactFormat = format === "pdf" ? DocumentFormat.PDF : DocumentFormat.DOCX;
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

/* ========== Erzeugte Datei durch eine eigene ersetzen ========== */

/** Lädt das Dokument und stellt sicher, dass das Format ersetzt werden darf. */
async function requireReplaceableArtifact(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
) {
    const document = await requireGeneratedDocument(type, id);

    if (!REPLACEABLE_STATUSES.has(document.status)) {
        throw new AppException(
            "Nur erzeugte oder hochgeladene Dokumente können ersetzt werden.",
            409,
            "DOCUMENT_NOT_REPLACEABLE",
        );
    }

    const artifact = findArtifact(document.artifacts, toDocumentFormat(format));
    if (!artifact) {
        throw new AppException("File not found", 404, "FILE_NOT_FOUND");
    }

    return { document, artifact };
}

/**
 * Ob diese Umgebung das Ersetzen erzeugter Dateien tragen kann.
 *
 * Der Upload läuft direkt aus dem Browser in den Objektspeicher, also muss
 * dreierlei stimmen: ein von aussen erreichbarer Endpunkt, ein antwortender
 * Speicher und eine CORS-Regel, die das `PUT` von der App-Origin erlaubt. Fehlt
 * das Letzte, läuft der Upload sogar durch — nur darf der Browser die Antwort
 * nicht lesen, und der Vorgang bliebe für immer unbestätigt.
 *
 * Das Ergebnis hängt an der Umgebung, nicht an Daten, und kostet zwei
 * S3-Roundtrips: deshalb kurz zwischengespeichert.
 */
export async function getDocumentCapabilities(): Promise<DocumentCapabilities> {
    const cached = capabilitiesCache;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    const value = await resolveDocumentCapabilities();
    capabilitiesCache = { value, expiresAt: Date.now() + CAPABILITIES_TTL_MS };

    return value;
}

async function resolveDocumentCapabilities(): Promise<DocumentCapabilities> {
    const issue = browserEndpointIssue();

    if (issue !== null) {
        return {
            canReplaceFiles: false,
            blocker: issue === "loopback" ? "endpoint_loopback" : "endpoint_private_network",
        };
    }

    if (!await isS3Available()) {
        return { canReplaceFiles: false, blocker: "storage_unreachable" };
    }

    // `unknown` heißt: Der Anbieter gibt die CORS-Konfiguration nicht heraus.
    // Das ist kein Grund, die Funktion abzuschalten.
    if (await bucketAllowsBrowserUploads() === "missing") {
        return { canReplaceFiles: false, blocker: "cors_not_configured" };
    }

    return { canReplaceFiles: true };
}

/**
 * Stellt eine signierte URL aus, unter der der Browser die Ersatzdatei direkt
 * nach S3 legt. Der Server sieht die Bytes dabei nie.
 *
 * S3 meldet den Abschluss nicht zurück — deshalb ist der Vorgang zweiteilig
 * und wird erst durch {@link confirmReplacementUpload} wirksam.
 */
export async function createReplacementUpload(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
) {
    await requireReplaceableArtifact(type, id, format);

    const objectKey = `${replacementPrefix(type, id)}${randomUUID()}.${format}`;
    const contentType = MIME_TYPES[format];

    return {
        url: await getDocumentUploadUrl(objectKey, contentType),
        objectKey,
        contentType,
    };
}

/**
 * Übernimmt eine hochgeladene Datei als neuen Inhalt des Artefakts.
 *
 * `remotePath`, `remoteEtag`, `uploadedAt` und `remoteSha256` bleiben bewusst
 * unangetastet: Liegt das Dokument bereits auf Nextcloud, entsteht dadurch die
 * sichtbare Abweichung, die der Nutzer anschließend gezielt auflöst.
 */
export async function confirmReplacementUpload(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
    objectKey: string,
) {
    const { artifact } = await requireReplaceableArtifact(type, id, format);

    if (!objectKey.startsWith(replacementPrefix(type, id)) || !objectKey.endsWith(`.${format}`)) {
        throw new AppException(
            "Der Objektschlüssel gehört nicht zu diesem Dokument.",
            400,
            "INVALID_OBJECT_KEY",
        );
    }

    let content: Buffer;
    try {
        content = await getDocumentArtifact(objectKey);
    } catch {
        throw new AppException(
            "Die hochgeladene Datei wurde nicht gefunden. Wurde der Upload abgeschlossen?",
            404,
            "UPLOAD_NOT_FOUND",
        );
    }

    // Eine signierte PUT-URL kann die Größe nicht begrenzen — das geht erst hier.
    if (content.length === 0) {
        await removeDocumentArtifact(objectKey).catch((error) => logger.error(error));
        throw new AppException("Die hochgeladene Datei ist leer.", 400, "EMPTY_FILE");
    }

    if (content.length > MAX_UPLOAD_BYTES) {
        await removeDocumentArtifact(objectKey).catch((error) => logger.error(error));
        throw new AppException(
            `Die Datei ist größer als ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
            413,
            "FILE_TOO_LARGE",
        );
    }

    const previousKey = artifact.objectKey;

    await prisma.documentArtifact.update({
        where: { id: artifact.id },
        data: {
            objectKey,
            size: content.length,
            sha256: sha256Document(content),
        },
    });

    // Erst nach dem Umbiegen: schlägt das Aufräumen fehl, bleibt nur ein
    // verwaistes Objekt zurück — der Datensatz ist bereits korrekt.
    if (previousKey !== objectKey) {
        await removeDocumentArtifact(previousKey).catch((error) => {
            logger.error('document_replacement_cleanup_failed', {
                objectKey: previousKey,
                error: (error as Error).message,
            });
        });
    }

    return requireGeneratedDocument(type, id);
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
    const document = await requireGeneratedDocument(type, id);

    if (document.status !== DocumentStatus.UPLOADED) {
        throw new AppException(
            "Nur bereits übertragene Dokumente können erneut übertragen werden.",
            409,
            "DOCUMENT_NOT_UPLOADED",
        );
    }

    const { pdf, docx } = artifactPair(document.artifacts);

    for (const artifact of [pdf, docx]) {
        if (artifact?.remotePath) {
            await deleteDocumentArtifact(artifact.remotePath);
        }
    }

    await prisma.$transaction(async (tx) => {
        const where = { id, deletedAt: null, status: DocumentStatus.UPLOADED };
        const data = { status: DocumentStatus.GENERATED };
        const reset = type === "offer"
            ? await tx.offerDocument.updateMany({ where, data })
            : await tx.orderDocument.updateMany({ where, data });

        if (reset.count !== 1) {
            throw new AppException(
                "Das Dokument wurde zwischenzeitlich verändert.",
                409,
                "DOCUMENT_STATE_CHANGED",
            );
        }

        await tx.documentArtifact.updateMany({
            where: { id: { in: [pdf?.id, docx?.id].filter((value): value is string => Boolean(value)) } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null, remoteSha256: null },
        });
    });

    return uploadGeneratedDocument(type, id);
}