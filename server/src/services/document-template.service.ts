import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { DocumentTemplateKind, Language } from "@prisma/client";
import PizZip from "pizzip";
import {
    getDocumentArtifact,
    getDocumentDownloadUrl,
    removeDocumentArtifact,
    storeObject,
} from "../lib/document-artifact-store.js";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { resolveTemplateName } from "../pipelines/offer/utils.js";
import logger from "@/utils/logger.js";

export const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Dieselbe Grenze wie beim Ersetzen erzeugter Dateien. */
const MAX_TEMPLATE_BYTES = 25 * 1024 * 1024;

/** Basisname der mitgelieferten Vorlage je Dokumentart unter `TEMPLATES_DIR`. */
const LEGACY_BASE_NAME: Record<DocumentTemplateKind, string> = {
    OFFER: "offer",
    ORDER: "order",
};

/**
 * Prüft den Inhalt statt des Dateinamens.
 *
 * Die Endung sagt über eine hochgeladene Datei nichts aus, und ein kaputtes
 * Template fällt sonst erst beim Rendern auf — im Worker, lange nachdem der
 * Nutzer den Dialog geschlossen hat. Ein DOCX ist ein ZIP mit `PK\x03\x04` am
 * Anfang und einer `word/document.xml` darin; genau das prüft `pizzip`, das
 * die Pipeline ohnehin schon benutzt.
 */
function assertDocxBuffer(content: Buffer): void {
    if (content.length === 0) {
        throw new AppException("Die Datei ist leer.", 400, "EMPTY_FILE");
    }

    if (content.length > MAX_TEMPLATE_BYTES) {
        throw new AppException(
            `Die Datei ist größer als ${MAX_TEMPLATE_BYTES / 1024 / 1024} MB.`,
            413,
            "FILE_TOO_LARGE",
        );
    }

    try {
        const zip = new PizZip(content);
        if (!zip.file("word/document.xml")) {
            throw new Error("missing word/document.xml");
        }
    } catch {
        throw new AppException(
            "Die Datei ist kein gültiges Word-Dokument (.docx).",
            400,
            "INVALID_DOCX",
        );
    }
}

const templateObjectKey = (kind: DocumentTemplateKind) =>
    `templates/${kind.toLowerCase()}/${randomUUID()}.docx`;

async function requireTemplate(id: string) {
    const template = await prisma.documentTemplate.findUnique({ where: { id } });

    if (!template) {
        throw new AppException("Vorlage nicht gefunden!", 404, "TEMPLATE_NOT_FOUND");
    }

    return template;
}

/**
 * Räumt ein Objekt weg, dessen Datensatz nicht mehr darauf zeigt.
 *
 * Bewusst nur geloggt: der Datensatz ist an dieser Stelle bereits korrekt,
 * ein fehlgeschlagenes Aufräumen hinterlässt lediglich ein verwaistes Objekt.
 */
async function discardObject(objectKey: string): Promise<void> {
    await removeDocumentArtifact(objectKey).catch((error) => {
        logger.error("template_object_cleanup_failed", {
            objectKey,
            error: (error as Error).message,
        });
    });
}

export function listTemplates() {
    return prisma.documentTemplate.findMany({
        orderBy: [{ kind: "asc" }, { language: "asc" }, { createdAt: "desc" }],
    });
}

export type CreateTemplateInput = {
    kind: DocumentTemplateKind;
    language: Language;
    name?: string;
    fileName: string;
    content: Buffer;
    userId?: string;
};

export async function createTemplate(input: CreateTemplateInput) {
    assertDocxBuffer(input.content);

    const stored = await storeObject(templateObjectKey(input.kind), input.content, DOCX_MIME);

    try {
        return await prisma.documentTemplate.create({
            data: {
                kind: input.kind,
                language: input.language,
                name: input.name?.trim() || input.fileName.replace(/\.docx$/i, ""),
                fileName: input.fileName,
                objectKey: stored.objectKey,
                size: stored.size,
                sha256: stored.sha256,
                createdById: input.userId ?? null,
            },
        });
    } catch (error) {
        // Ohne Datensatz ist das Objekt unerreichbar — weg damit, sonst wächst
        // der Bucket bei jedem fehlgeschlagenen Upload.
        await discardObject(stored.objectKey);
        throw error;
    }
}

/**
 * Übernimmt einen neuen Dateiinhalt — der Weg, auf dem der DOCX-Editor
 * speichert.
 *
 * Geschrieben wird unter einem neuen Schlüssel, der alte fällt erst nach dem
 * Datenbank-Update weg. Andersherum stünde der Datensatz zwischenzeitlich auf
 * einem Objekt, das es nicht mehr gibt.
 */
export async function replaceTemplateContent(id: string, content: Buffer) {
    const template = await requireTemplate(id);
    assertDocxBuffer(content);

    const stored = await storeObject(templateObjectKey(template.kind), content, DOCX_MIME);

    let updated;
    try {
        updated = await prisma.documentTemplate.update({
            where: { id },
            data: {
                objectKey: stored.objectKey,
                size: stored.size,
                sha256: stored.sha256,
            },
        });
    } catch (error) {
        await discardObject(stored.objectKey);
        throw error;
    }

    await discardObject(template.objectKey);

    return updated;
}

export async function renameTemplate(id: string, name: string) {
    await requireTemplate(id);

    return prisma.documentTemplate.update({
        where: { id },
        data: { name: name.trim() },
    });
}

/**
 * Setzt die Vorlage, gegen die der Slot künftig gerendert wird.
 *
 * Erst den Slot leeren, dann die neue Vorlage aktivieren — beides in einer
 * Transaktion, weil der partielle Unique-Index sonst zwischen den beiden
 * Schritten zuschlägt.
 */
export async function setActiveTemplate(id: string) {
    const template = await requireTemplate(id);

    return prisma.$transaction(async (tx) => {
        await tx.documentTemplate.updateMany({
            where: {
                kind: template.kind,
                language: template.language,
                isActive: true,
                id: { not: id },
            },
            data: { isActive: false },
        });

        return tx.documentTemplate.update({
            where: { id },
            data: { isActive: true },
        });
    });
}

export async function deleteTemplate(id: string) {
    const template = await requireTemplate(id);

    // Solange es Alternativen gibt, muss der Nutzer erst eine davon aktiv
    // setzen — sonst fiele der Slot stillschweigend auf die mitgelieferte
    // Vorlage zurück, und niemand sähe, warum das Dokument plötzlich anders
    // aussieht.
    //
    // Ist es dagegen die einzige Vorlage des Slots, ist das Löschen erlaubt:
    // sie wäre andernfalls für immer unlöschbar, und der Rückfall auf die
    // mitgelieferte Datei ist dann der einzig mögliche Zustand.
    if (template.isActive) {
        const alternatives = await prisma.documentTemplate.count({
            where: {
                kind: template.kind,
                language: template.language,
                id: { not: template.id },
            },
        });

        if (alternatives > 0) {
            throw new AppException(
                "Die aktive Vorlage kann nicht gelöscht werden. Setzen Sie zuerst eine andere aktiv.",
                409,
                "TEMPLATE_IS_ACTIVE",
            );
        }
    }

    await prisma.documentTemplate.delete({ where: { id } });
    await discardObject(template.objectKey);
}

export async function getTemplateContent(id: string) {
    const template = await requireTemplate(id);

    return { template, content: await getDocumentArtifact(template.objectKey) };
}

export async function getTemplateDownloadUrl(id: string) {
    const template = await requireTemplate(id);

    return getDocumentDownloadUrl(template.objectKey, `${template.name}.docx`, DOCX_MIME);
}

/**
 * Die Vorlage, gegen die gerendert wird.
 *
 * Die Kette endet bewusst auf dem Dateisystem: solange niemand etwas
 * hochgeladen hat — frisches Dev-Setup, bestehende Installation vor dem
 * Import — soll die Generierung unverändert weiterlaufen.
 *
 * Bewusst ohne Cache. Der zusätzliche GET fällt neben der
 * LibreOffice-Konvertierung nicht ins Gewicht, und eine gerade gesetzte
 * Vorlage soll sofort greifen und nicht erst nach Ablauf einer Frist.
 */
export async function loadTemplateForRendering(
    kind: DocumentTemplateKind,
    language: Language,
): Promise<Buffer> {
    const active =
        await prisma.documentTemplate.findFirst({ where: { kind, language, isActive: true } })
        // Wie schon `resolveTemplateName`: fehlt die Sprachvariante, gilt die
        // deutsche Vorlage.
        ?? (language === Language.DE
            ? null
            : await prisma.documentTemplate.findFirst({
                where: { kind, language: Language.DE, isActive: true },
            }));

    if (active) {
        logger.debug("template_resolved", { kind, language, templateId: active.id });
        return getDocumentArtifact(active.objectKey);
    }

    const legacyPath = resolveTemplateName(LEGACY_BASE_NAME[kind], language);
    logger.debug("template_resolved_legacy", { kind, language, path: legacyPath });

    try {
        return await fs.readFile(legacyPath);
    } catch {
        throw new AppException(
            `Für ${kind} (${language}) ist keine Vorlage hinterlegt.`,
            404,
            "TEMPLATE_NOT_FOUND",
        );
    }
}

