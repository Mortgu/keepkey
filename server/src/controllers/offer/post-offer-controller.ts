import { OfferFlatRate, OfferPosition } from "@prisma/client";
import { NextFunction, Request, Response } from 'express';
import env from '../../lib/env.js';
import { prisma } from "../../lib/prismaClient.js";
import calculatePrice from "../../utils/products.js";
import { toDate } from '../../utils/utils.js';

import fs from 'fs';
import path from 'path';
import { enqueueTask, uploadDocument, type UploadResult } from '../../lib/document.js';
import { generateOfferDisplayName } from '../../utils/documents.js';
import { pickTranslation } from '../../utils/i18n.js';
import logger from '../../middlewares/logger.js';

export const enqueueGeneration = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;

    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: {
            customer: true,
            offerPositions: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    }
                }
            }
        }
    });

    if (!offer) {
        return response.status(404).json({
            message: 'Offer not found!'
        });
    }

    const currentVersion = await prisma.offerDocument.findFirst({
        where: { offerId },
        select: { version: true },
        orderBy: { version: "desc" },
    });

    const nextVersion = (currentVersion?.version ?? 0) + 1;

    const formatedWorkloads = offer.offerPositions.map((op) => (
        pickTranslation(op.product.translations, offer.language)?.name ?? ""
    ).replaceAll(" ", "").trim())

    const displayName = generateOfferDisplayName(
        offer.quoteId,
        offer.customer.companyName,
        formatedWorkloads,
        nextVersion,
    )

    const task = await prisma.$transaction(async (tx) => {
        await tx.offerDocument.updateMany({
            where: { offerId, isCurrent: true },
            data: { isCurrent: false },
        });

        const task = await tx.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: "OFFER",
            },
        });

        await tx.offerDocument.create({
            data: {
                displayName: displayName,
                offerId,
                version: nextVersion,
                isCurrent: true,
                status: "PENDING",
                taskId: task.id,
            },
        });

        return task;
    });

    await enqueueTask(task.id);

    return response.status(200).json(task);
};

export const createOffer = async (request: Request, response: Response, next: NextFunction) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({ message: "Bad request" });
    }

    const { offer, positions, flatRates } = body;

    if (!offer || !positions) {
        return response.status(400).json({ message: "Bad request." });
    }

    for (const position of positions) {
        position["total_cents"] = await calculatePrice({
            productId: position.productId,
            contractId: position.contractId,
            duration: position.duration_months,
            quantity: position.quantity,
            customerId: offer.customerId,
        });
    }

    try {
        request.body.offer = await prisma.$transaction(async (tx) => {
            let net_amount_positions = positions.reduce(
                (sum: number, p: OfferPosition) => sum + p.total_cents, 0);

            let net_amount_flatrates = flatRates.reduce(
                (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

            let net_amount = net_amount_positions + net_amount_flatrates;

            const { supplierId, validUntil, requestFrom, date, ...offerFields } = body.offer;
            const offer = await tx.offer.create({
                data: {
                    ...offerFields,
                    date: toDate(date) ?? new Date(),
                    supplierId: supplierId || null,
                    validUntil: toDate(validUntil),
                    requestFrom: toDate(requestFrom),
                    net_amount: net_amount,
                },
            });

            for (const position of positions) {
                const { productId, contractId, duration_months, quantity, optional, total_cents } = position;
                await tx.offerPosition.create({
                    data: { offerId: offer.id, productId, contractId, duration_months, quantity, total_cents, optional },
                });
            }

            for (const flatRate of flatRates) {
                await tx.offerFlatRate.create({
                    data: {
                        offerId: offer.id,
                        flatRateId: flatRate.id,
                        quantity: flatRate.quantity,
                        total_cents: flatRate.total_cents
                    },
                });
            }

            return offer;
        });

        return response.status(200).json(offer);
    } catch (exception: any) {
        return response.status(408).json({
            message: "Something went wrong trying to create offer: " + exception.message,
            success: false,
        });
    }
};

export const uploadOfferDocument = async (request: Request, response: Response) => {
    const { id, documentId } = request.params;

    const PDF_PATH = env.NEXTCLOUD_OFFER_PDF_PATH;
    const DOCX_PATH = env.NEXTCLOUD_OFFER_ORIGINAL_PATH;

    const offerDoc = await prisma.offerDocument.findFirstOrThrow({
        where: { id: documentId as string, offerId: id as string },
        include: { pdf: true, docx: true },
    });

    if (!offerDoc.pdf || !offerDoc.docx) {
        return response.status(404).json({
            message: 'Documents not yet generated!'
        });
    }

    const displayName = offerDoc.displayName ?? offerDoc.id;
    const pdfFilename = `${displayName}.pdf`;
    const docxFilename = `${displayName}.docx`;

    const [pdfLocalPath, docxLocalPath] = [
        path.join(offerDoc.pdf.path, offerDoc.pdf.basename),
        path.join(offerDoc.docx.path, offerDoc.docx.basename),
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
        logger.error(`[uploadOfferDocument] upload failed: ${exception.message}`);
        await prisma.offerDocument.update({
            where: { id: offerDoc.id },
            data: { status: "FAILED", error: exception.message },
        }).catch((e: any) => logger.error(`[uploadOfferDocument] failed to persist error: ${e.message}`));

        return response.status(500).json({
            message: "Something went wrong while trying to upload docx and pdf: " + exception.message,
        });
    }

    await prisma.$transaction([
        prisma.offerDocument.update({
            where: { id: offerDoc.id },
            data: { status: "UPLOADED" },
        }),
        prisma.document.update({
            where: { id: offerDoc.pdf.id },
            data: {
                path: PDF_PATH,
                basename: pdfFilename,
                filename: pdfResult.remotePath,
                size: pdfResult.size,
                uploadedAt: pdfResult.uploadedAt,
            },
        }),
        prisma.document.update({
            where: { id: offerDoc.docx.id },
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
                logger.warn(`[uploadOfferDocument] failed to remove local file ${i === 0 ? "pdf" : "docx"}: ${r.reason?.message}`);
            }
        });
    });

    return response.status(200).json({
        docx: docxResult,
        pdf: pdfResult,
    });
}
