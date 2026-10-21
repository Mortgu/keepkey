import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import type { DocumentTemplateKind, Language } from "@prisma/client";
import { z } from "zod";
import type { DocumentType } from "@keepit/schemas";
import { prisma } from "../lib/prismaClient.js";
import { renderDocument } from "../lib/render-document.js";
import { storeDocumentArtifacts } from "../lib/document-artifact-store.js";
import { documentTable } from "./document-repo.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
} from "./document-generation.helpers.js";

/**
 * Der Teil jeder Dokument-Generierung, der für Offer, Order, Confirmation und
 * Invoice identisch ist: rendern, speichern, in einer Transaktion abschließen,
 * bei Fehlern aufräumen. Was je Typ wirklich unterschiedlich ist — wie das
 * Dokument zur Task gefunden wird, wie es gebaut wird, ob und wogegen es
 * veralten kann — steht im `GenerationAdapter`.
 */

type GeneratedDocument = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    artifacts: { format: DocumentFormat }[];
};

export type GenerationAdapter<TDoc extends GeneratedDocument> = {
    /** Für Fehlermeldungen, z.B. "OfferDocument". */
    typeName: string;
    type: DocumentType;
    findByTask: (taskId: string) => Promise<TDoc | null>;
    /**
     * Version der Quelle, wie sie beim Laden des Dokuments bekannt war.
     * `null`, wenn es für diesen Typ nichts gibt, wogegen eine Generierung
     * veralten könnte (Confirmation, Invoice: Konditionen sind ab Anlage
     * unveränderlich).
     */
    currentParentVersion: (doc: TDoc) => number | null;
    build: (doc: TDoc) => Promise<{ language: Language; data: Record<string, unknown>; displayName: string }>;
    templateKind: DocumentTemplateKind;
    renderSchema?: z.ZodType;
    ownerKey: (doc: TDoc) => Parameters<typeof createArtifactDocuments>[2];
    /**
     * Läuft nur, wenn `sourceVersion` nicht `null` ist: nimmt innerhalb der
     * Transaktion einen Lock und liest die aktuelle Version der Quelle
     * erneut, um einen Wettlauf während des Renderns zu erkennen. Wirft bei
     * Abweichung.
     */
    recheckNotStale: (tx: Prisma.TransactionClient, doc: TDoc) => Promise<void>;
    /** `where`, das alle anderen aktuellen Versionen dieser Quelle trifft. */
    demoteSiblingsWhere: (doc: TDoc) => Prisma.DocumentWhereInput;
};

export async function runGeneration<TDoc extends GeneratedDocument>(
    taskId: string,
    adapter: GenerationAdapter<TDoc>,
): Promise<void> {
    const doc = await adapter.findByTask(taskId);
    if (!doc) {
        throw new Error(`${adapter.typeName} for task ${taskId} was not found.`);
    }
    if (!assertDocumentCanBeGenerated(doc, adapter.typeName)) {
        return;
    }
    if (doc.sourceVersion != null && adapter.currentParentVersion(doc) !== doc.sourceVersion) {
        throw new Error(`${adapter.typeName} ${doc.id} is stale and must be regenerated.`);
    }

    const table = documentTable(adapter.type);
    const built = await adapter.build(doc);
    const rendered = await renderDocument(
        adapter.templateKind,
        built.language,
        built.data,
        { documentType: adapter.type, documentId: doc.id },
        { schema: adapter.renderSchema },
    );
    const files = await storeDocumentArtifacts(
        table.scope,
        doc.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            if (doc.sourceVersion != null) {
                await adapter.recheckNotStale(tx, doc);
            }
            await documentTable(adapter.type, tx).updateMany(adapter.demoteSiblingsWhere(doc), { isCurrent: false });
            await createArtifactDocuments(tx, files, adapter.ownerKey(doc));
            const finalized = await documentTable(adapter.type, tx).updateMany(
                { id: doc.id, deletedAt: null, status: DocumentStatus.PROCESSING },
                {
                    status: DocumentStatus.GENERATED,
                    displayName: built.displayName,
                    model: rendered.model as Prisma.InputJsonValue,
                    error: null,
                    isCurrent: true,
                },
            );
            if (finalized.count !== 1) {
                throw new Error(`${adapter.typeName} ${doc.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => table.findWithArtifacts(doc.id));
        if (!finalized) throw error;
    }
}
