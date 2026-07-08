import fs from "fs";
import path from "path";
import { Readable } from "stream";
import z from "zod";
import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { enqueueTask, uploadDocument, type UploadResult } from "../lib/document.js";
import { downloadDocumentStream } from "../lib/nextcloud.js";
import env from "../lib/env.js";
import logger from "../middlewares/logger.js";
import { toDate } from "../utils/utils.js";
import { createOrderSchema } from "../schemas/order-schemas.js";

/* ========== Types ========== */

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

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
    return prisma.order.findUnique({
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
            const stream = await downloadDocumentStream(file.filename);
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

    const existingOffer = await prisma.offer.findUnique({
        where: { id },
        include: {
            offerPositions: true,
            offerFlatRates: true,
        },
    });

    if (!existingOffer) {
        throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
    }

    return prisma.$transaction(async () => {
        const order = await prisma.order.create({
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

        await prisma.orderPosition.createMany({
            data: existingOffer.offerPositions.map((offerPosition) => ({
                orderId: order.id,
                productId: offerPosition.productId,
                contractId: offerPosition.contractId,
                duration_months: offerPosition.duration_months,
                quantity: offerPosition.quantity,
                optional: offerPosition.optional,
                total_cents: offerPosition.total_cents,
            })),
        });

        await prisma.orderFlatRate.createMany({
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

async function createDocumentForOrder(orderId: string) {
    const task = await prisma.$transaction(async (tx) => {
        await tx.orderDocument.updateMany({
            where: { orderId, isCurrent: true },
            data: { isCurrent: false },
        });

        const latestOrderDoc = await tx.orderDocument.findFirst({
            where: { orderId },
            orderBy: { version: "desc" },
            select: { version: true },
        });
        const nextVersion = (latestOrderDoc?.version ?? 0) + 1;

        const task = await tx.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: "ORDER",
            },
        });

        await tx.orderDocument.create({
            data: {
                orderId,
                version: nextVersion,
                isCurrent: true,
                status: "PENDING",
                taskId: task.id,
            },
        });

        return task;
    });

    await enqueueTask(task.id);
    return task;
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
): Promise<{ pdf: UploadResult; docx: UploadResult }> {
    const PDF_PATH = env.NEXTCLOUD_ORDER_PDF_PATH;
    const DOCX_PATH = env.NEXTCLOUD_ORDER_ORIGINAL_PATH;

    const orderDoc = await prisma.orderDocument.findFirstOrThrow({
        where: { id: documentId, orderId },
        include: { pdf: true, docx: true },
    });

    if (!orderDoc.pdf || !orderDoc.docx) {
        throw new AppException("Documents not yet generated!", 404, "DOCUMENTS_NOT_GENERATED");
    }

    const displayName = orderDoc.displayName ?? orderDoc.id;
    const pdfFilename = `${displayName}.pdf`;
    const docxFilename = `${displayName}.docx`;

    const [pdfLocalPath, docxLocalPath] = [
        path.join(orderDoc.pdf.path, orderDoc.pdf.basename),
        path.join(orderDoc.docx.path, orderDoc.docx.basename),
    ];

    let pdfResult: UploadResult;
    let docxResult: UploadResult;

    try {
        const [pdfContent, docxContent] = await Promise.all([
            fs.promises.readFile(pdfLocalPath),
            fs.promises.readFile(docxLocalPath),
        ]);

        [pdfResult, docxResult] = await Promise.all([
            uploadDocument(pdfFilename, PDF_PATH, pdfContent),
            uploadDocument(docxFilename, DOCX_PATH, docxContent),
        ]);
    } catch (exception: any) {
        logger.error(`[uploadOrderDocument] upload failed: ${exception.message}`);
        await prisma.orderDocument.update({
            where: { id: orderDoc.id },
            data: { status: "FAILED", error: exception.message },
        }).catch((e: any) => logger.error(`[uploadOrderDocument] failed to persist error: ${e.message}`));

        throw new AppException(
            "Something went wrong while trying to upload docx and pdf: " + exception.message,
            500,
            "DOCUMENT_UPLOAD_FAILED",
        );
    }

    await prisma.$transaction([
        prisma.orderDocument.update({
            where: { id: orderDoc.id },
            data: { status: "UPLOADED" },
        }),
        prisma.document.update({
            where: { id: orderDoc.pdf.id },
            data: {
                path: PDF_PATH,
                basename: pdfFilename,
                filename: pdfResult.remotePath,
                size: pdfResult.size,
                uploadedAt: pdfResult.uploadedAt,
            },
        }),
        prisma.document.update({
            where: { id: orderDoc.docx.id },
            data: {
                path: DOCX_PATH,
                basename: docxFilename,
                filename: docxResult.remotePath,
                size: docxResult.size,
                uploadedAt: docxResult.uploadedAt,
            },
        }),
    ]);

    await Promise.allSettled([
        fs.promises.rm(pdfLocalPath, { force: true }),
        fs.promises.rm(docxLocalPath, { force: true }),
    ]).then((results) => {
        results.forEach((r, i) => {
            if (r.status === "rejected") {
                logger.warn(`[uploadOrderDocument] failed to remove local file ${i === 0 ? "pdf" : "docx"}: ${r.reason?.message}`);
            }
        });
    });

    return { pdf: pdfResult, docx: docxResult };
}

/* ========== Deletes ========== */

export async function deleteOrderById(id: string): Promise<void> {
    await prisma.order.delete({
        where: { id },
    });
}
