import fs from "fs";
import path from "path";
import { Readable } from "stream";
import z from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { downloadDocumentStream } from "../lib/nextcloud.js";
import { uploadOrderDocument as uploadOrderDocumentUseCase } from "./document-upload.service.js";
import { requestOrderGeneration } from "./document-generation-request.service.js";
import { toDate } from "../utils/utils.js";
import { createOrderSchema, updateOrderSchema } from "../schemas/order-schemas.js";
import {
    buildOrderRevisionSnapshot,
    parseOrderRevisionSnapshot,
} from "../schemas/revision-schemas.js";

/* ========== Types ========== */

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export type OrderDocumentDownload =
    | { kind: "stream"; stream: Readable; contentType: string; downloadName: string }
    | { kind: "file"; filePath: string; contentType: string; downloadName: string };

const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/* ========== Queries ========== */

export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            customer: true,
            customerContactPerson: true,
            documents: {
                orderBy: { version: "desc" as const },
                include: {
                    pdf: true,
                    docx: true,
                    task: true,
                },
            },
            orderPositions: {
                include: {
                    product: { include: { translations: true } },
                    contract: { include: { translations: true } },
                },
            },
            flatRates: {
                include: {
                    flatRate: { include: { translations: true } },
                },
            },
        },
    });
}

export async function getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            customer: true,
            customerContactPerson: true,
            documents: {
                orderBy: { version: "desc" as const },
                include: {
                    pdf: true,
                    docx: true,
                    task: true,
                },
            },
            orderPositions: {
                include: {
                    product: { include: { translations: true } },
                    contract: { include: { translations: true } },
                },
            },
            flatRates: {
                include: {
                    flatRate: { include: { translations: true } },
                },
            },
        },
    });

    if (!order) {
        throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    }

    return order;
}

export async function getOrderRevisions(orderId: string) {
    const exists = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!exists) {
        throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    }

    return prisma.orderRevision.findMany({
        where: { orderId },
        orderBy: { version: "desc" },
        select: {
            id: true,
            version: true,
            createdAt: true,
            changedBy: { select: { id: true, name: true } },
        },
    });
}

export async function getNextOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AB-${year}-`;

    const latest = await prisma.order.findFirst({
        where: { orderId: { startsWith: prefix } },
        select: { orderId: true },
        orderBy: { orderId: "desc" },
    });

    let nextNumber = 1;
    if (latest?.orderId) {
        const match = latest.orderId.match(/(\d+)$/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

export async function downloadOrderDocument(
    orderId: string,
    documentId: string,
    format: string
): Promise<OrderDocumentDownload> {
    if (format !== "pdf" && format !== "docx") {
        throw new AppException("Invalid format. Use 'pdf' or 'docx'.", 400, "INVALID_FORMAT");
    }

    const orderDoc = await prisma.orderDocument.findFirst({
        where: { orderId, id: documentId },
        include: { pdf: true, docx: true },
    });

    if (!orderDoc) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    if (orderDoc.status !== "GENERATED" && orderDoc.status !== "UPLOADED") {
        throw new AppException("Document not yet generated", 409, "DOCUMENT_NOT_GENERATED");
    }

    const file = format === "pdf" ? orderDoc.pdf : orderDoc.docx;
    if (!file) {
        throw new AppException("File not found", 404, "FILE_NOT_FOUND");
    }

    const contentType = MIME_TYPES[format]!;
    const downloadName = `${orderDoc.displayName ?? orderDoc.id}.${format}`;

    if (orderDoc.status === "UPLOADED") {
        try {
            const stream = await downloadDocumentStream(file.remotePath ?? file.filename);
            return { kind: "stream", stream, contentType, downloadName };
        } catch (exception: any) {
            if (exception instanceof AppException) throw exception;
            throw new AppException(
                "Failed to download from Nextcloud: " + exception.message,
                500,
                "NEXTCLOUD_DOWNLOAD_FAILED",
            );
        }
    }

    const filePath = path.join(file.path, file.basename);

    try {
        await fs.promises.access(filePath);
    } catch {
        throw new AppException("File not found on disk", 404, "FILE_NOT_FOUND_ON_DISK");
    }

    return { kind: "file", filePath, contentType, downloadName };
}

/* ========== Mutations ========== */

export async function createOrder(input: CreateOrderInput) {
    const { id, orderId, date, projectNumber, projectDescription, orderDetails } = input;

    return prisma.$transaction(async (tx) => {
        const existingOffer = await tx.offer.findUnique({
            where: { id },
            include: {
                offerPositions: true,
                offerFlatRates: true,
            },
        });
        if (!existingOffer) {
            throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
        }

        const order = await tx.order.create({
            data: {
                supplierId: existingOffer.supplierId,
                customerId: existingOffer.customerId,
                contactPersonId: existingOffer.contactPersonId,
                employeeId: existingOffer.userId,
                offerId: existingOffer.id,

                orderId,
                paymentTerm: existingOffer.paymentTerm,

                projectNumber: projectNumber ?? null,
                projectDescription: projectDescription ?? null,
                orderDetails: orderDetails ?? null,

                date: toDate(date) ?? new Date(),
                validUntil: existingOffer.validUntil,
                requestFrom: existingOffer.requestFrom,

                net_amount: existingOffer.net_amount,
            },
        });

        await tx.orderPosition.createMany({
            data: existingOffer.offerPositions.map((offerPosition) => ({
                orderId: order.id,
                productId: offerPosition.productId,
                contractId: offerPosition.contractId,
                duration_months: offerPosition.duration_months,
                quantity: offerPosition.quantity,
                optional: offerPosition.optional,
                total_cents: offerPosition.total_cents - offerPosition.discount_cents,
            })),
        });

        await tx.orderFlatRate.createMany({
            data: existingOffer.offerFlatRates.map((offerFlatRate) => ({
                flatRateId: offerFlatRate.flatRateId,
                orderId: order.id,
                quantity: offerFlatRate.quantity,
                total_cents: offerFlatRate.total_cents,
            })),
        });

        return order;
    });
}

async function replaceOrderPositions(
    tx: Prisma.TransactionClient,
    orderId: string,
    positions: UpdateOrderInput["positions"],
) {
    await tx.orderPosition.deleteMany({ where: { orderId } });
    await tx.orderPosition.createMany({
        data: positions.map((position) => ({ orderId, ...position })),
    });
}

async function replaceOrderFlatRates(
    tx: Prisma.TransactionClient,
    orderId: string,
    flatRates: UpdateOrderInput["flatRates"],
) {
    await tx.orderFlatRate.deleteMany({ where: { orderId } });
    await tx.orderFlatRate.createMany({
        data: flatRates.map((flatRate) => ({ orderId, ...flatRate })),
    });
}

export async function updateOrder(orderId: string, input: UpdateOrderInput, actorId: string) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${orderId}`}))::text AS "lock"`;

        const current = await tx.order.findUnique({
            where: { id: orderId },
            include: { orderPositions: true, flatRates: true },
        });
        if (!current) {
            throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
        }
        if (current.version !== input.expectedVersion) {
            throw new AppException(
                "The order was changed by another user. Reload it and try again.",
                409,
                "VERSION_CONFLICT",
            );
        }

        const snapshot = buildOrderRevisionSnapshot(current as unknown as Record<string, unknown>);
        await tx.orderRevision.create({
            data: {
                orderId,
                version: current.version,
                changedById: actorId,
                snapshotVersion: 1,
                snapshot: snapshot as Prisma.InputJsonValue,
            },
        });

        const net_amount =
            input.positions.reduce((sum, position) => sum + position.total_cents, 0) +
            input.flatRates.reduce((sum, flatRate) => sum + flatRate.total_cents, 0);
        const order = await tx.order.update({
            where: { id: orderId },
            data: {
                ...input.order,
                date: new Date(input.order.date),
                validUntil: input.order.validUntil ? new Date(input.order.validUntil) : null,
                requestFrom: input.order.requestFrom ? new Date(input.order.requestFrom) : null,
                net_amount,
                version: { increment: 1 },
            },
        });

        await replaceOrderPositions(tx, orderId, input.positions);
        await replaceOrderFlatRates(tx, orderId, input.flatRates);
        await tx.orderDocument.updateMany({
            where: { orderId, isCurrent: true },
            data: { isCurrent: false },
        });

        return order;
    });
}

export async function restoreOrderRevision(
    orderId: string,
    revisionId: string,
    expectedVersion: number,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${orderId}`}))::text AS "lock"`;

        const current = await tx.order.findUnique({
            where: { id: orderId },
            include: { orderPositions: true, flatRates: true },
        });
        if (!current) {
            throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
        }
        if (current.version !== expectedVersion) {
            throw new AppException(
                "The order was changed by another user. Reload it and try again.",
                409,
                "VERSION_CONFLICT",
            );
        }

        const revision = await tx.orderRevision.findFirst({
            where: { id: revisionId, orderId },
            select: { snapshot: true, snapshotVersion: true },
        });
        if (!revision) {
            throw new AppException("Order revision not found", 404, "ORDER_REVISION_NOT_FOUND");
        }
        if (revision.snapshotVersion !== 1) {
            throw new AppException(
                `Order revision snapshot version ${revision.snapshotVersion} is not supported.`,
                422,
                "UNSUPPORTED_REVISION_SNAPSHOT_VERSION",
            );
        }

        let restored;
        try {
            restored = parseOrderRevisionSnapshot(revision.snapshot);
        } catch {
            throw new AppException(
                "The stored order revision is invalid and cannot be restored.",
                422,
                "INVALID_REVISION_SNAPSHOT",
            );
        }

        const currentSnapshot = buildOrderRevisionSnapshot(current as unknown as Record<string, unknown>);
        await tx.orderRevision.create({
            data: {
                orderId,
                version: current.version,
                changedById: actorId,
                snapshotVersion: 1,
                snapshot: currentSnapshot as Prisma.InputJsonValue,
            },
        });

        const order = await tx.order.update({
            where: { id: orderId },
            data: {
                ...restored.order,
                date: new Date(restored.order.date),
                validUntil: restored.order.validUntil ? new Date(restored.order.validUntil) : null,
                requestFrom: restored.order.requestFrom ? new Date(restored.order.requestFrom) : null,
                version: { increment: 1 },
            },
        });

        await replaceOrderPositions(tx, orderId, restored.positions);
        await replaceOrderFlatRates(tx, orderId, restored.flatRates);
        await tx.orderDocument.updateMany({
            where: { orderId, isCurrent: true },
            data: { isCurrent: false },
        });

        return order;
    });
}

async function createDocumentForOrder(orderId: string) {
    return requestOrderGeneration(orderId);
}

export async function createOrderTask(orderId: string): Promise<void> {
    await createDocumentForOrder(orderId);
}

export async function generateOrderDocument(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true },
    });

    if (!order) {
        throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    }

    return createDocumentForOrder(orderId);
}

export async function uploadOrderDocument(
    orderId: string,
    documentId: string
) {
    return uploadOrderDocumentUseCase(orderId, documentId);
}

/* ========== Deletes ========== */

export async function deleteOrderById(id: string): Promise<void> {
    await prisma.order.delete({
        where: { id },
    });
}
