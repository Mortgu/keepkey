import { Prisma } from "@prisma/client";
import env from "../lib/env.js";
import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import type { DocumentArtifactScope } from "../lib/document-artifact-store.js";
import type { DocumentType } from "@keepit/schemas";

/**
 * Der einzige Ort, der weiß, welche Prisma-Tabelle hinter einem `DocumentType`
 * steckt. Alle Dokumenttabellen (offer_document, order_document, …) haben
 * dieselben Spalten bis auf den Fremdschlüssel zum Elternobjekt — deshalb
 * reichen hier ein paar Operationen mit gemeinsamen `where`/`data`-Typen.
 *
 * Ein neuer Dokumenttyp ist ein weiterer `case`. Sonst nichts.
 */

/** Filter, die für jede Dokumenttabelle gültig sind (ohne Eltern-FK). */
export type DocumentWhere =
    Prisma.OfferDocumentWhereInput & Prisma.OrderDocumentWhereInput & Prisma.ConfirmationDocumentWhereInput & Prisma.InvoiceDocumentWhereInput;

/** Updates, die für jede Dokumenttabelle gültig sind. */
export type DocumentUpdate =
    Prisma.OfferDocumentUpdateManyMutationInput
    & Prisma.OrderDocumentUpdateManyMutationInput
    & Prisma.ConfirmationDocumentUpdateManyMutationInput
    & Prisma.InvoiceDocumentUpdateManyMutationInput;

export type DocumentWithArtifacts = NonNullable<
    Awaited<ReturnType<ReturnType<typeof documentTable>["findWithArtifacts"]>>
>;

/** 404-auslösender Wrapper um `findWithArtifacts` — ein fehlendes Dokument ist nie ein gültiges Ergebnis für den Aufrufer. */
async function requireFrom<T>(find: () => Promise<T | null>): Promise<T> {
    const document = await find();
    if (!document) throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    return document;
}

/** Für alle Typen außer `offer`: keiner kennt den Zustand "eingefroren". */
const neverEditable = { assertEditable: async () => {}, canAdopt: async () => false };

export function documentTable(type: DocumentType, client: Prisma.TransactionClient = prisma) {
    switch (type) {
        case "offer": {
            const findWithArtifacts = (id: string) => client.offerDocument.findFirst({
                where: { id, deletedAt: null },
                include: { artifacts: true },
            });
            return {
                scope: "offers" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_OFFER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_OFFER_ORIGINAL_PATH,
                },
                findWithArtifacts,
                requireWithArtifacts: (id: string) => requireFrom(() => findWithArtifacts(id)),
                /** Der Render-Snapshot — global ausgenommen, nur hier gezielt gelesen. */
                readModel: async (id: string) => (await client.offerDocument.findUnique({
                    where: { id },
                    select: { model: true },
                }))?.model ?? null,
                reloadWithArtifacts: (id: string) => client.offerDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.offerDocument.updateMany({ where, data }),
                /**
                 * Angenommene Angebote sind dauerhaft eingefroren — ihre Dokumente dürfen dann
                 * weder umbenannt, gelöscht noch ersetzt werden.
                 */
                assertEditable: async (id: string) => {
                    const doc = await client.offerDocument.findUnique({
                        where: { id },
                        select: { offer: { select: { acceptedAt: true } } },
                    });
                    if (doc?.offer.acceptedAt) {
                        throw new AppException(
                            "Accepted offers' documents can no longer be changed.",
                            409,
                            "OFFER_ACCEPTED",
                        );
                    }
                },
                /**
                 * Ob sich Änderungen dieses Dokuments ins Angebot übernehmen lassen: nur beim
                 * aktuellen Dokument des unveränderten Angebots. Wurde das Angebot nach dem
                 * Erzeugen geändert (oder ist es angenommen), würde ein Wert aus der Datei
                 * einen neueren Stand überschreiben.
                 */
                canAdopt: async (id: string): Promise<boolean> => {
                    const document = await client.offerDocument.findUnique({
                        where: { id },
                        select: { isCurrent: true, sourceVersion: true, offer: { select: { version: true, acceptedAt: true } } },
                    });
                    return Boolean(document?.isCurrent)
                        && document?.sourceVersion === document?.offer.version
                        && !document?.offer.acceptedAt;
                },
            };
        }
        case "order": {
            const findWithArtifacts = (id: string) => client.orderDocument.findFirst({
                where: { id, deletedAt: null },
                include: { artifacts: true },
            });
            return {
                scope: "orders" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_ORDER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_ORDER_ORIGINAL_PATH,
                },
                findWithArtifacts,
                requireWithArtifacts: (id: string) => requireFrom(() => findWithArtifacts(id)),
                /** Der Render-Snapshot — global ausgenommen, nur hier gezielt gelesen. */
                readModel: async (id: string) => (await client.orderDocument.findUnique({
                    where: { id },
                    select: { model: true },
                }))?.model ?? null,
                reloadWithArtifacts: (id: string) => client.orderDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.orderDocument.updateMany({ where, data }),
                ...neverEditable,
            };
        }
        case "confirmation": {
            const findWithArtifacts = (id: string) => client.confirmationDocument.findFirst({
                where: { id, deletedAt: null },
                include: { artifacts: true },
            });
            return {
                scope: "confirmations" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_CONFIRMATION_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_CONFIRMATION_ORIGINAL_PATH,
                },
                findWithArtifacts,
                requireWithArtifacts: (id: string) => requireFrom(() => findWithArtifacts(id)),
                /** Der Render-Snapshot — global ausgenommen, nur hier gezielt gelesen. */
                readModel: async (id: string) => (await client.confirmationDocument.findUnique({
                    where: { id },
                    select: { model: true },
                }))?.model ?? null,
                reloadWithArtifacts: (id: string) => client.confirmationDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.confirmationDocument.updateMany({ where, data }),
                ...neverEditable,
            };
        }
        case "invoice": {
            const findWithArtifacts = (id: string) => client.invoiceDocument.findFirst({
                where: { id, deletedAt: null },
                include: { artifacts: true },
            });
            return {
                scope: "invoices" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_INVOICE_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_INVOICE_ORIGINAL_PATH,
                },
                findWithArtifacts,
                requireWithArtifacts: (id: string) => requireFrom(() => findWithArtifacts(id)),
                /** Der Render-Snapshot — global ausgenommen, nur hier gezielt gelesen. */
                readModel: async (id: string) => (await client.invoiceDocument.findUnique({
                    where: { id },
                    select: { model: true },
                }))?.model ?? null,
                reloadWithArtifacts: (id: string) => client.invoiceDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.invoiceDocument.updateMany({ where, data }),
                ...neverEditable,
            };
        }
    }
}
