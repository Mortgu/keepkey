import { DocumentOwnerType, TaskTarget } from "@prisma/client";
import env from "../../../lib/env.js";
import { buildOrder } from "../../../pipelines/order/build-order.js";
import { lockOrder } from "../../order.service.js";
import type { DocumentTypeDefinition } from "../document-types.js";

/** Stornierte Bestellungen sind eingefroren — ihre Dokumente bleiben unverändert. */
export const order: DocumentTypeDefinition = {
    ownerType: DocumentOwnerType.ORDER,
    taskTarget: TaskTarget.ORDER,
    ownerKey: "orderId",
    scope: "orders",
    nextcloud: {
        pdfDirectory: env.NEXTCLOUD_ORDER_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_ORDER_ORIGINAL_PATH,
    },
    templateKind: "ORDER",
    lockOwner: lockOrder,
    frozen: { code: "ORDER_CANCELLED", subject: "Cancelled orders" },
    frozenAt: async (tx, orderId) => (await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        select: { cancelledAt: true },
    })).cancelledAt,
    currentSourceVersion: async (tx, orderId) => (await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        select: { version: true },
    })).version,
    nextDocumentVersion: async (tx, orderId) => (await tx.order.update({
        where: { id: orderId },
        data: { documentVersion: { increment: 1 } },
        select: { documentVersion: true },
    })).documentVersion,
    build: buildOrder,
};
