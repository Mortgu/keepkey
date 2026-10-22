import { DocumentOwnerType, TaskTarget } from "@prisma/client";
import env from "../../../lib/env.js";
import { AppException } from "../../../lib/exceptions.js";
import { buildInvoice } from "../../../pipelines/invoice/build-invoice.js";
import { lockOrder } from "../../order.service.js";
import type { DocumentTypeDefinition } from "../document-types.js";

/**
 * Eine Rechnung ist eingefroren wie ihre Bestellung — deshalb sperrt sie deren Lock.
 * Rechnungskonditionen sind ab Anlage unveränderlich: es gibt nichts, wogegen eine
 * Generierung veralten könnte.
 */
export const invoice: DocumentTypeDefinition = {
    ownerType: DocumentOwnerType.INVOICE,
    taskTarget: TaskTarget.INVOICE,
    ownerKey: "invoiceId",
    scope: "invoices",
    nextcloud: {
        pdfDirectory: env.NEXTCLOUD_INVOICE_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_INVOICE_ORIGINAL_PATH,
    },
    templateKind: "INVOICE",
    lockOwner: async (tx, invoiceId) => {
        const row = await tx.invoice.findUnique({ where: { id: invoiceId }, select: { orderId: true } });
        if (!row) throw new AppException("Invoice not found", 404, "INVOICE_NOT_FOUND");
        await lockOrder(tx, row.orderId);
    },
    frozen: { code: "ORDER_CANCELLED", subject: "Cancelled orders" },
    frozenAt: async (tx, invoiceId) => (await tx.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
        select: { order: { select: { cancelledAt: true } } },
    })).order.cancelledAt,
    currentSourceVersion: async () => null,
    nextDocumentVersion: async (tx, invoiceId) => (await tx.invoice.update({
        where: { id: invoiceId },
        data: { documentVersion: { increment: 1 } },
        select: { documentVersion: true },
    })).documentVersion,
    build: buildInvoice,
};
