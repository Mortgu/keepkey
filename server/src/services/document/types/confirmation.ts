import { DocumentOwnerType, TaskTarget } from "@prisma/client";
import env from "../../../lib/env.js";
import { AppException } from "../../../lib/exceptions.js";
import { buildConfirmation } from "../../../pipelines/confirmation/build-confirmation.js";
import { lockOrder } from "../../order.service.js";
import type { DocumentTypeDefinition } from "../document-types.js";

/**
 * Eine AB ist eingefroren wie ihre Bestellung — deshalb sperrt sie deren Lock.
 * AB-Konditionen sind ab Anlage unveränderlich: es gibt nichts, wogegen eine
 * Generierung veralten könnte.
 */
export const confirmation: DocumentTypeDefinition = {
    ownerType: DocumentOwnerType.CONFIRMATION,
    taskTarget: TaskTarget.CONFIRMATION,
    ownerKey: "confirmationId",
    scope: "confirmations",
    nextcloud: {
        pdfDirectory: env.NEXTCLOUD_CONFIRMATION_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_CONFIRMATION_ORIGINAL_PATH,
    },
    templateKind: "CONFIRMATION",
    lockOwner: async (tx, confirmationId) => {
        const row = await tx.confirmation.findUnique({ where: { id: confirmationId }, select: { orderId: true } });
        if (!row) throw new AppException("Confirmation not found", 404, "CONFIRMATION_NOT_FOUND");
        await lockOrder(tx, row.orderId);
    },
    frozen: { code: "ORDER_CANCELLED", subject: "Cancelled orders" },
    frozenAt: async (tx, confirmationId) => (await tx.confirmation.findUniqueOrThrow({
        where: { id: confirmationId },
        select: { order: { select: { cancelledAt: true } } },
    })).order.cancelledAt,
    currentSourceVersion: async () => null,
    nextDocumentVersion: async (tx, confirmationId) => (await tx.confirmation.update({
        where: { id: confirmationId },
        data: { documentVersion: { increment: 1 } },
        select: { documentVersion: true },
    })).documentVersion,
    build: buildConfirmation,
};
