import { NextFunction, Request, Response } from 'express';
import env from '../../lib/env.js';
import { OfferFlatRate, OfferPosition, prisma } from "../../lib/prismaClient.js";

import fs from 'fs';
import path from 'path';
import { enqueueTask, uploadDocument, type UploadResult } from '../../lib/document.js';
import logger from '../../middlewares/logger.js';
import { generateOfferDisplayName } from '../../utils/documents.js';
import { pickTranslation } from '../../utils/i18n.js';
import calculatePrice from '../../utils/products.js';
import { toDate } from '../../utils/utils.js';

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
    const { positions, flatrates } = request.body;

    try {
        for (const position of positions) {
            position["total_cents"] = await calculatePrice({
                productId: position.productId,
                contractId: position.contractId,
                duration: position.duration_months,
                quantity: position.quantity,
                customerId: request.body.offer.customerId,
            });
        }

        for (const flatrate of flatrates) {
            const rate = await prisma.flatRate.findUniqueOrThrow({
                where: { id: flatrate.flatRateId },
                select: { total_cents: true }
            });
            flatrate["total_cents"] = rate.total_cents * flatrate.quantity;
        }

        request.body.offer = await prisma.$transaction(async (tx) => {
            let net_amount_positions = positions.reduce(
                (sum: number, p: OfferPosition) => sum + p.total_cents, 0);

            let net_amount_flatrates = flatrates.reduce(
                (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

            let net_amount = net_amount_positions + net_amount_flatrates;

            const { supplierId, validUntil, requestFrom, date, ...offerFields } = request.body.offer;

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

            for (const flatrate of flatrates) {
                await tx.offerFlatRate.create({
                    data: {
                        offerId: offer.id,
                        flatRateId: flatrate.flatRateId,
                        quantity: flatrate.quantity,
                        total_cents: flatrate.total_cents
                    },
                });
            }

            return offer;
        });

        return response.status(200).json(request.body.offer);
    } catch (exception: any) {
        return response.status(408).json({
            message: "Something went wrong trying to create offer: " + exception.message,
            success: false,
        });
    }
};

export const createOfferPositions = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id as string;
    const body = request.body;

    if (!(body instanceof Array)) {
        return response.status(400).json({
            message: ""
        })
    }

    try {
        const offerPositions = [];

        for (const element of body) {
            const total_cents = await calculatePrice({
                productId: element.productId,
                contractId: element.contractId,
                duration: element.duration_months,
                quantity: element.quantity,
            });

            const offerPosition = await prisma.offerPosition.create({
                data: {
                    offerId: id,
                    ...element,
                    total_cents
                }
            });

            offerPositions.push(offerPosition);
        }

        const offer = await prisma.offer.findUniqueOrThrow({
            where: { id },
            select: { net_amount: true }
        });

        await prisma.offer.update({
            where: { id },
            data: {
                net_amount: offerPositions.reduce((acc, position) => acc + position.total_cents, offer.net_amount ?? 0),
            }
        })

        return response.status(200).json(offerPositions);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export const createOfferFlatrates = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id as string;
    const body = request.body;

    if (!(body instanceof Array)) {
        return response.status(400).json({
            message: "dwadwa"
        })
    }

    try {
        const flatrates = [];

        for (const element of body) {
            const rate = await prisma.flatRate.findUniqueOrThrow({
                where: { id: element.flatRateId },
                select: { total_cents: true }
            });

            const created = await prisma.offerFlatRate.create({
                data: {
                    offerId: id,
                    ...element,
                    total_cents: rate.total_cents,
                }
            });

            flatrates.push(created);
        }

        const offer = await prisma.offer.findUniqueOrThrow({
            where: { id },
            select: { net_amount: true }
        });

        await prisma.offer.update({
            where: { id },
            data: {
                net_amount: flatrates.reduce((acc, flatrate) => acc + flatrate.total_cents, offer.net_amount ?? 0),
            }
        })

        return response.status(200).json(flatrates);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

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
