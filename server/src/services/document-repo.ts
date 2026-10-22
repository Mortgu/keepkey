import { DocumentOwnerType, Prisma } from "@prisma/client";
import env from "../lib/env.js";
import { prisma } from "../lib/prismaClient.js";
import { AppException, assertNotFrozen } from "../lib/exceptions.js";
import type { DocumentArtifactScope } from "../lib/document-artifact-store.js";
import type { DocumentType } from "@keepit/schemas";

/**
 * Der einzige Ort, der weiß, wie ein `DocumentType` auf die gemeinsame
 * `Document`-Tabelle (document_record) abgebildet wird. Alle Dokumenttypen
 * liegen in derselben Tabelle, unterschieden durch `type` — jede Operation
 * filtert darauf, damit eine echte ID eines anderen Typs nie gefunden wird.
 *
 * Ein neuer Dokumenttyp ist ein weiterer `case`. Sonst nichts.
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

/** Die Übernahme editierter Felder aus einer ersetzten DOCX ist eine reine Angebots-Funktion. */
const canAdoptNever = { canAdopt: async () => false };

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

const OWNER_TYPES: Record<DocumentType, DocumentOwnerType> = {
    offer: DocumentOwnerType.OFFER,
    order: DocumentOwnerType.ORDER,
    confirmation: DocumentOwnerType.CONFIRMATION,
    invoice: DocumentOwnerType.INVOICE,
};

/** Der `type`-Diskriminator in document_record für einen `DocumentType`. */
export function documentOwnerType(type: DocumentType): DocumentOwnerType {
    return OWNER_TYPES[type];
}

export function documentTable(type: DocumentType, client: Prisma.TransactionClient = prisma) {
    const ownerType = documentOwnerType(type);
    switch (type) {
        case "offer": {
            return {
                scope: "offers" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_OFFER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_OFFER_ORIGINAL_PATH,
                },
                ...typedOperations(ownerType, client),
                /**
                 * Angenommene Angebote sind dauerhaft eingefroren — ihre Dokumente dürfen dann
                 * weder umbenannt, gelöscht noch ersetzt werden.
                 */
                assertEditable: async (id: string) => {
                    const doc = await client.document.findFirst({
                        where: { id, type: ownerType },
                        select: { offer: { select: { acceptedAt: true } } },
                    });
                    assertNotFrozen(
                        doc?.offer?.acceptedAt,
                        "OFFER_ACCEPTED",
                        "Accepted offers' documents can no longer be changed.",
                    );
                },
                /**
                 * Ob sich Änderungen dieses Dokuments ins Angebot übernehmen lassen: nur beim
                 * aktuellen Dokument des unveränderten Angebots. Wurde das Angebot nach dem
                 * Erzeugen geändert (oder ist es angenommen), würde ein Wert aus der Datei
                 * einen neueren Stand überschreiben.
                 */
                canAdopt: async (id: string): Promise<boolean> => {
                    const document = await client.document.findFirst({
                        where: { id, type: ownerType },
                        select: { isCurrent: true, sourceVersion: true, offer: { select: { version: true, acceptedAt: true } } },
                    });
                    return Boolean(document?.isCurrent)
                        && document?.sourceVersion === document?.offer?.version
                        && !document?.offer?.acceptedAt;
                },
            };
        }
        case "order": {
            return {
                scope: "orders" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_ORDER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_ORDER_ORIGINAL_PATH,
                },
                ...typedOperations(ownerType, client),
                /** Stornierte Bestellungen sind eingefroren — ihre Dokumente bleiben unverändert. */
                assertEditable: async (id: string) => {
                    const doc = await client.document.findFirst({
                        where: { id, type: ownerType },
                        select: { order: { select: { cancelledAt: true } } },
                    });
                    assertNotFrozen(
                        doc?.order?.cancelledAt,
                        "ORDER_CANCELLED",
                        "Cancelled orders' documents can no longer be changed.",
                    );
                },
                ...canAdoptNever,
            };
        }
        case "confirmation": {
            return {
                scope: "confirmations" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_CONFIRMATION_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_CONFIRMATION_ORIGINAL_PATH,
                },
                ...typedOperations(ownerType, client),
                /** Eine AB zu einer stornierten Bestellung ist eingefroren wie die Bestellung selbst. */
                assertEditable: async (id: string) => {
                    const doc = await client.document.findFirst({
                        where: { id, type: ownerType },
                        select: { confirmation: { select: { order: { select: { cancelledAt: true } } } } },
                    });
                    assertNotFrozen(
                        doc?.confirmation?.order.cancelledAt,
                        "ORDER_CANCELLED",
                        "Cancelled orders' confirmations can no longer be changed.",
                    );
                },
                ...canAdoptNever,
            };
        }
        case "invoice": {
            return {
                scope: "invoices" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_INVOICE_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_INVOICE_ORIGINAL_PATH,
                },
                ...typedOperations(ownerType, client),
                /** Eine Rechnung zu einer stornierten Bestellung ist eingefroren wie die Bestellung selbst. */
                assertEditable: async (id: string) => {
                    const doc = await client.document.findFirst({
                        where: { id, type: ownerType },
                        select: { invoice: { select: { order: { select: { cancelledAt: true } } } } },
                    });
                    assertNotFrozen(
                        doc?.invoice?.order.cancelledAt,
                        "ORDER_CANCELLED",
                        "Cancelled orders' invoices can no longer be changed.",
                    );
                },
                ...canAdoptNever,
            };
        }
    }
}
