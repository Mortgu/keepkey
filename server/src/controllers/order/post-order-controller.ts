import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../../lib/prismaClient.js";
import { enqueueTask, uploadDocument, type UploadResult } from "../../lib/document.js";
import env from "../../lib/env.js";
import logger from "../../middlewares/logger.js";
import { toDate } from "../../utils/utils.js";


export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const { id, orderId, date, projectNumber, projectDescription, orderDetails } = request.body;

    const existingOffer = await prisma.offer.findUnique({
        where: { id: id as string },
        include: {
            offerPositions: true,
            offerFlatRates: true,
        },
    });

    if (!existingOffer) {
        return response.status(404).json({
            message: "Offer not found!",
        });
    }

    try {
        request.body.order = await prisma.$transaction(async () => {
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
        next();
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to create order from offer!",
        });
    }
};

const createDocumentForOrder = async (orderId: string) => {
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
};

// Middleware — called after createOrder in the route chain
export const createOrderTask = async (request: Request, response: Response) => {
    const { order } = request.body;

    if (!order) {
        return response.status(404).json({
            message: "Failed to create order task. Missing order in body!",
        });
    }

    try {
        await createDocumentForOrder(order.id);
        return response.status(200).json(order);
    } catch (exception: any) {
        return response.status(500).json({
            message: `Failed to create task for order: ${order.id}`,
        });
    }
};

// Standalone endpoint — manually trigger document generation for an existing order
export const generateOrderDocument = async (request: Request, response: Response) => {
    const orderId = request.params.orderId as string;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true },
    });

    if (!order) {
        return response.status(404).json({ message: "Order not found" });
    }

    try {
        const task = await createDocumentForOrder(orderId);
        return response.status(200).json({ taskId: task.id });
    } catch (exception: any) {
        return response.status(500).json({
            message: `Failed to generate document for order: ${orderId}`,
        });
    }
};

export const uploadOrderDocument = async (request: Request, response: Response) => {
    const { orderId, documentId } = request.params;

    const PDF_PATH = env.NEXTCLOUD_ORDER_PDF_PATH;
    const DOCX_PATH = env.NEXTCLOUD_ORDER_ORIGINAL_PATH;

    const orderDoc = await prisma.orderDocument.findFirstOrThrow({
        where: { id: documentId as string, orderId: orderId as string },
        include: { pdf: true, docx: true },
    });

    if (!orderDoc.pdf || !orderDoc.docx) {
        return response.status(404).json({
            message: 'Documents not yet generated!'
        });
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

        return response.status(500).json({
            message: "Something went wrong while trying to upload docx and pdf: " + exception.message,
        });
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

    return response.status(200).json({
        docx: docxResult,
        pdf: pdfResult,
    });
};
