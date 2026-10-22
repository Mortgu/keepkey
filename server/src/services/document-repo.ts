import { DocumentOwnerType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import { AppException, assertNotFrozen } from "../lib/exceptions.js";
import type { DocumentType } from "@keepit/schemas";
import { documentTypes } from "./document/document-types.js";

/**
 * Zugriff auf die gemeinsame `Document`-Tabelle (document_record), eingeschränkt
 * auf einen `DocumentType`. Alle Dokumenttypen liegen in derselben Tabelle,
 * unterschieden durch `type` — jede Operation filtert darauf, damit eine echte
 * ID eines anderen Typs nie gefunden wird. Was je Typ verschieden ist, steht in
 * seiner `DocumentTypeDefinition` (`document/types/`).
 */

export type DocumentWithArtifacts = NonNullable<
    Awaited<ReturnType<ReturnType<typeof documentTable>["findWithArtifacts"]>>
>;

/** 404-auslösender Wrapper um `findWithArtifacts` — ein fehlendes Dokument ist nie ein gültiges Ergebnis für den Aufrufer. */
async function requireFrom<T>(find: () => Promise<T | null>): Promise<T> {
    const document = await find();
    if (!document) throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    return document;
}

/** Die für alle Typen identischen Operationen, eingeschränkt auf einen `type`. */
function typedOperations(type: DocumentOwnerType, client: Prisma.TransactionClient) {
    const findWithArtifacts = (id: string) => client.document.findFirst({
        where: { id, type, deletedAt: null },
        include: { artifacts: true },
    });
    return {
        findWithArtifacts,
        requireWithArtifacts: (id: string) => requireFrom(() => findWithArtifacts(id)),
        /** Der Render-Snapshot — global ausgenommen, nur hier gezielt gelesen. */
        readModel: async (id: string) => (await client.document.findFirst({
            where: { id, type },
            select: { model: true },
        }))?.model ?? null,
        reloadWithArtifacts: (id: string) => client.document.findFirst({
            where: { id, type },
            include: { artifacts: true },
        }),
        updateMany: (where: Prisma.DocumentWhereInput, data: Prisma.DocumentUpdateManyMutationInput) =>
            client.document.updateMany({ where: { ...where, type }, data }),
    };
}

/** Der `type`-Diskriminator in document_record für einen `DocumentType`. */
export function documentOwnerType(type: DocumentType): DocumentOwnerType {
    return documentTypes[type].ownerType;
}

export function documentTable(type: DocumentType, client: Prisma.TransactionClient = prisma) {
    const definition = documentTypes[type];
    return {
        scope: definition.scope,
        nextcloud: definition.nextcloud,
        ...typedOperations(definition.ownerType, client),
        /** Ein eingefrorener Eigentümer friert seine Dokumente mit ein: kein Umbenennen, Löschen, Ersetzen. */
        assertEditable: async (id: string) => {
            const doc = await client.document.findFirst({
                where: { id, type: definition.ownerType },
                select: { offerId: true, orderId: true, confirmationId: true, invoiceId: true },
            });
            const ownerId = doc?.[definition.ownerKey];
            if (!ownerId) return;
            assertNotFrozen(
                await definition.frozenAt(client, ownerId),
                definition.frozen.code,
                `${definition.frozen.subject}' documents can no longer be changed.`,
            );
        },
        canAdopt: async (id: string): Promise<boolean> => definition.canAdopt?.(client, id) ?? false,
    };
}
