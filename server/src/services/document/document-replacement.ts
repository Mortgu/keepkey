import { randomUUID } from "node:crypto";
import { DocumentStatus } from "@prisma/client";
import { artifactPair, findArtifact } from "../../lib/document-artifacts.js";
import {
    MIME_TYPES,
    browserEndpointIssue,
    bucketAllowsBrowserUploads,
    getDocumentArtifact,
    getDocumentUploadUrl,
    isS3Available,
    removeDocumentArtifact,
    storeObject,
    toDocumentFormat,
    type DocumentArtifactScope,
    type StoredDocumentArtifact,
} from "../../lib/document-artifact-store.js";
import { assertDocxBuffer } from "../../lib/docx.js";
import { checkReplacement, isUserWarning } from "../../lib/replacement-check.js";
import { offerAdoptions } from "../../pipelines/offer/offer-adoption.js";
import { convertDocxToPdf } from "../../lib/docx-to-pdf.js";
import { AppException } from "../../lib/exceptions.js";
import { sha256Document } from "../../lib/nextcloud-document-store.js";
import { prisma } from "../../lib/prismaClient.js";
import logger from "@/utils/logger.js";
import type { DocumentCapabilities, DocumentFormatParam, DocumentType, ReplacementWarning } from "@keepit/schemas";
import { documentTable } from "./document-repo.js";

/** Kurz genug, dass eine gesetzte CORS-Regel zügig sichtbar wird. */
const CAPABILITIES_TTL_MS = 60_000;
let capabilitiesCache: { value: DocumentCapabilities; expiresAt: number } | null = null;

/**
 * Ersetzen ist erlaubt, sobald es überhaupt ein Artefakt gibt. Bei `UPLOADED`
 * bleibt der Status stehen — es entsteht lediglich eine sichtbare Abweichung
 * zum Stand auf Nextcloud, die der Nutzer gezielt auflösen kann.
 */
const REPLACEABLE_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADED,
]);

const scopeOf = (type: DocumentType): DocumentArtifactScope => documentTable(type).scope;

/**
 * Präfix, unter dem ersetzte Dateien liegen.
 *
 * Der Schlüssel wird immer serverseitig gebildet und beim Bestätigen gegen
 * dieses Präfix geprüft — ein vom Client frei gewählter Schlüssel könnte sonst
 * jedes beliebige Objekt im Bucket überschreiben.
 */
const replacementPrefix = (type: DocumentType, documentId: string) =>
    `replaced/${scopeOf(type)}/${documentId}/`;

/** Lädt das Dokument und stellt sicher, dass das Format ersetzt werden darf. */
async function requireReplaceableArtifact(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
) {
    /*
     * Nur die DOCX ist ersetzbar: die PDF wird beim Bestätigen aus ihr erzeugt.
     * Eine direkt ersetzte PDF wäre dauerhaft nicht mehr aus ihrer DOCX
     * ableitbar — die beiden Artefakte würden auseinanderlaufen, ohne dass es
     * je wieder zusammenfindet.
     */
    if (format !== "docx") {
        throw new AppException(
            "Nur die DOCX kann ersetzt werden — die PDF wird daraus erzeugt.",
            409,
            "DOCUMENT_FORMAT_NOT_REPLACEABLE",
        );
    }

    const document = await documentTable(type).requireWithArtifacts(id);
    await documentTable(type).assertEditable(id);

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
 * Entfernt ein Objekt, das nicht mehr gebraucht wird, ohne den Aufrufer zu
 * unterbrechen. Ein verwaistes Objekt ist schlimmstenfalls belegter Speicher —
 * ein abgebrochener Aufräumversuch darf den eigentlichen Fehler nicht verdecken.
 */
async function discardObject(objectKey: string): Promise<void> {
    await removeDocumentArtifact(objectKey).catch((error) => {
        logger.error('document_replacement_cleanup_failed', {
            objectKey,
            error: (error as Error).message,
        });
    });
}

/**
 * Prüft eine hochgeladene DOCX gegen das Modell, aus dem das Dokument erzeugt
 * wurde. Die Prüfung ist eine Hilfe, kein Tor: scheitert sie, wird der Upload
 * trotzdem übernommen.
 */
async function inspectReplacement(
    type: DocumentType,
    id: string,
    docx: Buffer,
): Promise<ReplacementWarning[]> {
    try {
        const warnings = checkReplacement({
            documentType: type,
            documentId: id,
            model: await documentTable(type).readModel(id),
            docx,
        });
        const silent = warnings.filter((warning) => !isUserWarning(warning));
        if (silent.length > 0) {
            logger.info('document_replacement_not_comparable', {
                documentId: id,
                reasons: silent.map((warning) => warning.code),
            });
        }

        const adoptNow = warnings.some((warning) => warning.code === "FIELD_CHANGED")
            && await documentTable(type).canAdopt(id);
        return warnings.filter(isUserWarning).map((warning): ReplacementWarning =>
            warning.code === "FIELD_CHANGED"
                ? { ...warning, adoptable: adoptNow && Boolean(offerAdoptions[warning.field]?.parse(warning.actual)) }
                : warning);
    } catch (error) {
        logger.error('document_replacement_inspection_failed', {
            documentId: id,
            error: (error as Error).message,
        });
        return [];
    }
}

/**
 * Übernimmt eine hochgeladene DOCX als neuen Inhalt — und erzeugt die PDF neu.
 *
 * Die PDF muss mitgezogen werden, sonst zeigt sie weiter auf den alten
 * generierten Stand: Download und Nextcloud-Abgleich lieferten dann eine PDF,
 * die nicht zur DOCX daneben passt.
 *
 * Die Reihenfolge trägt den Rollback: Konvertiert und abgelegt wird alles
 * **vor** dem ersten Schreibvorgang in der Datenbank. Jeder frisch abgelegte
 * Objektschlüssel (DOCX, dann PDF) wird gesammelt; scheitert irgendein
 * Schritt danach, räumt ein einziger Pfad alles bisher Gesammelte auf einmal
 * auf, statt pro Schritt einen eigenen Aufräumzweig zu pflegen.
 *
 * `remotePath`, `remoteEtag`, `uploadedAt` und `remoteSha256` bleiben bewusst
 * unangetastet: Liegt das Dokument bereits auf Nextcloud, entsteht dadurch die
 * sichtbare Abweichung, die der Nutzer anschließend gezielt auflöst — jetzt für
 * beide Artefakte.
 */
export async function confirmReplacementUpload(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
    objectKey: string,
) {
    await requireReplaceableArtifact(type, id, format);

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

    // Was bereits abgelegt wurde und bei einem Fehlschlag wieder aufzuräumen ist.
    const staged = [objectKey];

    let warnings: ReplacementWarning[];
    let storedPdf: StoredDocumentArtifact;
    let previous: { docx: string; pdf: string };

    try {
        /*
         * Eine signierte PUT-URL prüft weder Größe noch Inhalt — das geht erst hier.
         * Und die Umwandlung unten taugt nicht als Ersatzprüfung: LibreOffice nimmt
         * auch eine reine Textdatei an und rendert sie klaglos, eine Nicht-DOCX käme
         * so unbemerkt durch.
         */
        assertDocxBuffer(content);

        warnings = await inspectReplacement(type, id, content);

        let pdfContent: Buffer;
        try {
            pdfContent = await convertDocxToPdf(content);
        } catch (error) {
            logger.error('document_replacement_conversion_failed', {
                documentId: id,
                error: (error as Error).message,
            });
            throw new AppException(
                "Die hochgeladene Datei konnte nicht nach PDF umgewandelt werden. "
                + "Ist es eine gültige DOCX?",
                422,
                "DOCX_CONVERSION_FAILED",
            );
        }

        const pdfKey = `${replacementPrefix(type, id)}${randomUUID()}.pdf`;
        storedPdf = await storeObject(pdfKey, pdfContent, MIME_TYPES.pdf);
        staged.push(pdfKey);

        previous = await prisma.$transaction(async (tx) => {
            // Zwei gleichzeitige Ersetzungen dürfen sich nicht überlagern: die
            // zweite soll die erste vollständig ablösen, nicht halb.
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`document-replace:${id}`}))::text AS "lock"`;

            const current = await documentTable(type, tx).findWithArtifacts(id);
            if (!current) {
                throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
            }
            if (!REPLACEABLE_STATUSES.has(current.status)) {
                throw new AppException(
                    "Das Dokument wurde zwischenzeitlich verändert.",
                    409,
                    "DOCUMENT_STATE_CHANGED",
                );
            }

            // Innerhalb der Sperre neu gelesen: nur so sind es wirklich die
            // Schlüssel, die diese Ersetzung ablöst.
            const { pdf, docx } = artifactPair(current.artifacts);
            if (!pdf || !docx) {
                throw new AppException(
                    "Document has incomplete artifact links.",
                    500,
                    "INVALID_UPLOAD_METADATA",
                );
            }

            await tx.documentArtifact.update({
                where: { id: docx.id },
                data: {
                    objectKey,
                    size: content.length,
                    sha256: sha256Document(content),
                },
            });
            await tx.documentArtifact.update({
                where: { id: pdf.id },
                data: {
                    objectKey: storedPdf.objectKey,
                    size: storedPdf.size,
                    sha256: storedPdf.sha256,
                },
            });

            return { docx: docx.objectKey, pdf: pdf.objectKey };
        });
    } catch (error) {
        await Promise.all(staged.map(discardObject));
        throw error;
    }

    /*
     * Ab hier ist die Datenbank bereits auf dem neuen Stand — ein Fehler in
     * den folgenden Schritten darf die frisch verknüpften Objekte nicht mehr
     * als „gescheitert“ wegräumen, sie sind ja jetzt die gültigen Artefakte.
     * Deshalb liegen Aufräumen der alten Objekte und das Neulesen bewusst
     * außerhalb des obigen `try`.
     */
    for (const previousKey of [previous.docx, previous.pdf]) {
        if (previousKey !== objectKey && previousKey !== storedPdf.objectKey) {
            await discardObject(previousKey);
        }
    }

    return { ...await documentTable(type).requireWithArtifacts(id), warnings };
}
