import { Prisma } from "@prisma/client";
import env from "@/config/env.js";
import { prisma } from "@/core/prisma.js";
import type { DocumentArtifactScope } from "./storage/artifact-store.js";
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

export function documentTable(type: DocumentType, client: Prisma.TransactionClient = prisma) {
    switch (type) {
        case "offer":
            return {
                scope: "offers" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_OFFER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_OFFER_ORIGINAL_PATH,
                },
                findWithArtifacts: (id: string) => client.offerDocument.findFirst({
                    where: { id, deletedAt: null },
                    include: { artifacts: true },
                }),
                reloadWithArtifacts: (id: string) => client.offerDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.offerDocument.updateMany({ where, data }),
            };
        case "order":
            return {
                scope: "orders" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_ORDER_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_ORDER_ORIGINAL_PATH,
                },
                findWithArtifacts: (id: string) => client.orderDocument.findFirst({
                    where: { id, deletedAt: null },
                    include: { artifacts: true },
                }),
                reloadWithArtifacts: (id: string) => client.orderDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.orderDocument.updateMany({ where, data }),
            };
        case "confirmation":
            return {
                scope: "confirmations" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_CONFIRMATION_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_CONFIRMATION_ORIGINAL_PATH,
                },
                findWithArtifacts: (id: string) => client.confirmationDocument.findFirst({
                    where: { id, deletedAt: null },
                    include: { artifacts: true },
                }),
                reloadWithArtifacts: (id: string) => client.confirmationDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.confirmationDocument.updateMany({ where, data }),
            };
        case "invoice":
            return {
                scope: "invoices" satisfies DocumentArtifactScope as DocumentArtifactScope,
                nextcloud: {
                    pdfDirectory: env.NEXTCLOUD_INVOICE_PDF_PATH,
                    docxDirectory: env.NEXTCLOUD_INVOICE_ORIGINAL_PATH,
                },
                findWithArtifacts: (id: string) => client.invoiceDocument.findFirst({
                    where: { id, deletedAt: null },
                    include: { artifacts: true },
                }),
                reloadWithArtifacts: (id: string) => client.invoiceDocument.findUnique({
                    where: { id },
                    include: { artifacts: true },
                }),
                updateMany: (where: DocumentWhere, data: DocumentUpdate) =>
                    client.invoiceDocument.updateMany({ where, data }),
            };
    }
}
