import type { DocumentFormat, DocumentStatus } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import { buildInvoice } from "../pipelines/invoice/build-invoice.js";
import { runGeneration, type GenerationAdapter } from "./document-generation.js";

type InvoiceDocumentForGeneration = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    invoiceId: string;
    artifacts: { format: DocumentFormat }[];
};

/**
 * Rechnungskonditionen sind ab Anlage unveränderlich — siehe
 * `confirmation-generation.service.ts`.
 */
const invoiceAdapter: GenerationAdapter<InvoiceDocumentForGeneration> = {
    typeName: "InvoiceDocument",
    type: "invoice",
    findByTask: (taskId) => prisma.invoiceDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { artifacts: true },
    }),
    currentParentVersion: () => null,
    build: (doc) => buildInvoice(doc.invoiceId),
    templateKind: "INVOICE",
    ownerKey: (doc) => ({ invoiceDocumentId: doc.id }),
    recheckNotStale: async () => {},
    demoteSiblingsWhere: (doc) => ({ invoiceId: doc.invoiceId, isCurrent: true }),
};

export async function generateInvoiceDocument(taskId: string): Promise<void> {
    return runGeneration(taskId, invoiceAdapter);
}
