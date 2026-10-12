import { AppException } from "../lib/exceptions.js";
import { Prisma, Task, TaskTarget } from "@prisma/client";
import { enqueueTask } from "../lib/document.js";
import { prisma } from "../lib/prismaClient.js";

type GenerationRequestAdapter = {
    lockKey: string;
    target: TaskTarget;
    /**
     * `null`, wenn es für diesen Typ nichts gibt, wogegen eine Generierung
     * veralten könnte (Confirmation, Invoice: Konditionen sind ab Anlage
     * unveränderlich) — dedupliziert dann gegen jede laufende Generierung
     * dieser Quelle, unabhängig von einer Version.
     */
    currentSourceVersion: (tx: Prisma.TransactionClient) => Promise<number | null>;
    findActive: (tx: Prisma.TransactionClient, sourceVersion: number | null) => Promise<{ task: Task } | null>;
    nextVersion: (tx: Prisma.TransactionClient) => Promise<number>;
    createDocument: (
        tx: Prisma.TransactionClient,
        taskId: string,
        version: number,
        sourceVersion: number | null,
    ) => Promise<void>;
};

async function requestGeneration(adapter: GenerationRequestAdapter): Promise<Task> {
    const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${adapter.lockKey}))::text AS "lock"`;

        const sourceVersion = await adapter.currentSourceVersion(tx);
        const active = await adapter.findActive(tx, sourceVersion);
        if (active) return { task: active.task, created: false };

        const version = await adapter.nextVersion(tx);
        const task = await tx.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: adapter.target,
            },
        });
        await adapter.createDocument(tx, task.id, version, sourceVersion);

        return { task, created: true };
    });

    await enqueueTask(result.task.id, { markFailedOnError: result.created });
    return result.task;
}

export function requestOfferGeneration(
    offerId: string,
    displayNameForVersion: (version: number) => string,
): Promise<Task> {
    return requestGeneration({
        lockKey: `offer-generation:${offerId}`,
        target: TaskTarget.OFFER,
        currentSourceVersion: async (tx) => {
            const offer = await tx.offer.findUniqueOrThrow({
                where: { id: offerId },
                select: { version: true, acceptedAt: true },
            });
            if (offer.acceptedAt) {
                throw new AppException("Accepted offers cannot generate new documents.", 409, "OFFER_ACCEPTED");
            }
            return offer.version;
        },
        findActive: (tx, sourceVersion) => tx.offerDocument.findFirst({
            where: { offerId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.offer.update({
            where: { id: offerId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.offerDocument.create({
                data: {
                    displayName: displayNameForVersion(version),
                    offerId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}

export function requestOrderGeneration(orderId: string): Promise<Task> {
    return requestGeneration({
        lockKey: `order-generation:${orderId}`,
        target: TaskTarget.ORDER,
        currentSourceVersion: async (tx) => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${orderId}`}))::text AS "lock"`;
            const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { version: true, cancelledAt: true } });
            if (order.cancelledAt) throw new AppException("Cancelled orders cannot generate documents.", 409, "ORDER_CANCELLED");
            return order.version;
        },
        findActive: (tx, sourceVersion) => tx.orderDocument.findFirst({
            where: { orderId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.order.update({
            where: { id: orderId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.orderDocument.create({
                data: {
                    orderId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}

/**
 * AB-Konditionen sind ab Anlage unveränderlich — `currentSourceVersion` liefert
 * deshalb immer `null`, es gibt nichts, wogegen eine Generierung veralten
 * könnte. Dedupliziert trotzdem gegen eine laufende Generierung.
 */
export function requestConfirmationGeneration(confirmationId: string): Promise<Task> {
    return requestGeneration({
        lockKey: `confirmation-generation:${confirmationId}`,
        target: TaskTarget.CONFIRMATION,
        currentSourceVersion: async (tx) => {
            const confirmation = await tx.confirmation.findUnique({
                where: { id: confirmationId },
                select: { order: { select: { cancelledAt: true } } },
            });
            if (!confirmation) throw new AppException("Confirmation not found", 404, "CONFIRMATION_NOT_FOUND");
            if (confirmation.order.cancelledAt) {
                throw new AppException("Cancelled orders cannot generate documents.", 409, "ORDER_CANCELLED");
            }
            return null;
        },
        findActive: (tx, sourceVersion) => tx.confirmationDocument.findFirst({
            where: { confirmationId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.confirmation.update({
            where: { id: confirmationId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.confirmationDocument.create({
                data: {
                    confirmationId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}

/**
 * Rechnungskonditionen sind ab Anlage unveränderlich — siehe
 * `requestConfirmationGeneration`.
 */
export function requestInvoiceGeneration(invoiceId: string): Promise<Task> {
    return requestGeneration({
        lockKey: `invoice-generation:${invoiceId}`,
        target: TaskTarget.INVOICE,
        currentSourceVersion: async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: invoiceId },
                select: { order: { select: { cancelledAt: true } } },
            });
            if (!invoice) throw new AppException("Invoice not found", 404, "INVOICE_NOT_FOUND");
            if (invoice.order.cancelledAt) {
                throw new AppException("Cancelled orders cannot generate documents.", 409, "ORDER_CANCELLED");
            }
            return null;
        },
        findActive: (tx, sourceVersion) => tx.invoiceDocument.findFirst({
            where: { invoiceId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.invoice.update({
            where: { id: invoiceId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.invoiceDocument.create({
                data: {
                    invoiceId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}