import { DocumentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prismaClient.js";
import { renderDocument } from "../../lib/render-document.js";
import { storeDocumentArtifacts } from "../../lib/document-artifact-store.js";
import { withDocumentVersion } from "../../utils/documents.js";
import { documentTable } from "../document-repo.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
} from "../document-generation.helpers.js";
import { documentTypeForOwnerType, documentTypes, ownerColumn } from "./document-types.js";

/**
 * Rendert das Dokument einer Task, speichert es und schließt es in einer
 * Transaktion ab — für alle Dokumenttypen gleich. Was je Typ verschieden ist,
 * steht in seiner `DocumentTypeDefinition`.
 */
export async function runGeneration(taskId: string): Promise<void> {
    const doc = await prisma.document.findFirst({
        where: { taskId, deletedAt: null },
        include: { artifacts: true },
    });
    if (!doc) {
        throw new Error(`Document for task ${taskId} was not found.`);
    }
    const type = documentTypeForOwnerType(doc.type);
    const definition = documentTypes[type];
    const label = `${doc.type} document`;
    const ownerId = doc[definition.ownerKey];
    if (ownerId == null) {
        // Der CHECK document_record_type_owner_check verhindert das — hier hieße es, er wurde umgangen.
        throw new Error(`Document ${doc.id} is missing its owner field "${definition.ownerKey}".`);
    }
    if (!assertDocumentCanBeGenerated(doc, label)) {
        return;
    }
    if (doc.sourceVersion != null && await definition.currentSourceVersion(prisma, ownerId) !== doc.sourceVersion) {
        throw new Error(`${label} ${doc.id} is stale and must be regenerated.`);
    }

    const table = documentTable(type);
    const built = await definition.build(ownerId);
    const rendered = await renderDocument(
        definition.templateKind,
        built.language,
        built.data,
        { documentType: type, documentId: doc.id },
        { schema: definition.renderSchema },
    );
    const files = await storeDocumentArtifacts(
        definition.scope,
        doc.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            if (doc.sourceVersion != null) {
                // Erneut unter Lock lesen: die Quelle kann sich während des Renderns geändert haben.
                await definition.lockOwner(tx, ownerId);
                if (await definition.currentSourceVersion(tx, ownerId) !== doc.sourceVersion) {
                    throw new Error(`${label} ${doc.id} became stale during generation.`);
                }
            }
            await documentTable(type, tx).updateMany(
                { ...ownerColumn(definition.ownerKey, ownerId), isCurrent: true },
                { isCurrent: false },
            );
            await createArtifactDocuments(tx, files, { documentId: doc.id });
            const finalized = await documentTable(type, tx).updateMany(
                { id: doc.id, deletedAt: null, status: DocumentStatus.PROCESSING },
                {
                    status: DocumentStatus.GENERATED,
                    displayName: withDocumentVersion(built.baseName, doc.version),
                    model: rendered.model as Prisma.InputJsonValue,
                    error: null,
                    isCurrent: true,
                },
            );
            if (finalized.count !== 1) {
                throw new Error(`${label} ${doc.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => table.findWithArtifacts(doc.id));
        if (!finalized) throw error;
    }
}
