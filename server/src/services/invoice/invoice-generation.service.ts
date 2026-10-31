import type { DocumentFormat, DocumentStatus } from "@prisma/client";
import { prisma } from "../../lib/prismaClient.js";
import { documentOwnerType } from "../document/document-repo.js";
import { buildInvoice } from "../../pipelines/invoice/build-invoice.js";
import { runGeneration, type GenerationAdapter } from "../document/document-generation.js";
import { requireOwner } from "../document/document-generation.helpers.js";

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
    findByTask: async (taskId) => requireOwner(await prisma.document.findFirst({
        where: { taskId, type: documentOwnerType("invoice"), deletedAt: null },
        include: { artifacts: true },
    }), "invoiceId"),
    currentParentVersion: () => null,
    build: (doc) => buildInvoice(doc.invoiceId),
    templateType: "INVOICE",
    ownerKey: (doc) => ({ documentId: doc.id }),
    recheckNotStale: async () => {},
    demoteSiblingsWhere: (doc) => ({ invoiceId: doc.invoiceId, isCurrent: true }),
};

export async function generateInvoiceDocument(taskId: string): Promise<void> {
    return runGeneration(taskId, invoiceAdapter);
}
