import { NextFunction, Request, Response } from 'express';
import { prisma } from "../../lib/prismaClient.js";
import { OfferFlatRate, OfferPosition, Task } from "@prisma/client";
import { toDate } from '../../utils/utils.js';
import calculatePrice from "../../utils/products.js";
import env from '../../lib/env.js';

import fs from 'fs';
import path from 'path';
import { generateDocument, uploadDocument } from '../../lib/document.js';

/*
 * Function to enqueue a new reservation job for an offer.
 * [POST] /api/offer/:id/reserve
 */

export const createReservation = async (request: Request, response: Response, next: NextFunction) => {
    /* This function creates two ".reserved" files in the NEXTCLOUD_OFFER_PATH (NEXTCLOUD_OFFER_PDF_PATH, NEXTCLOUD_OFFER_ORIGINAL_PATH) */

    const { id } = request.params;
};

export const enqueueGeneration = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;

    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId }
    });

    if (!offer) {
        return response.status(404).json({
            message: 'Offer not found!'
        });
    }

    const document = await prisma.document.create({
        data: {
            displayName: null,
            status: "PENDING",
            taskId: null,
            format: "DOCX"
        }
    });

    const currentVersion = await prisma.offerDocument.findFirst({
        where: { offerId: offerId },
        select: { version: true },
        orderBy: { version: "desc" }
    });

    const offerDocument = await prisma.offerDocument.create({
        data: {
            offerId: offerId,
            documentId: document.id,
            version: (currentVersion?.version ?? -1) + 1,
        }
    });

    const task: Task = await generateDocument(document);

    return response.status(200).json(task);
};

async function enqueueOfferReservation(offerId: string, opts: { chainGenerationOnSuccess?: boolean } = {}) {
    console.log("enqueueOfferReservation")
}

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

    const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId as string },
    });

    if (!document || !document.displayName) {
        return response.status(404).json({
            message: 'Something went wrong! Document not found!'
        });
    }

    const [pdfContent, docxContent] = await Promise.all([
        fs.readFileSync(path.join(env.OUTPUT_DIR, document.id + ".pdf")),
        fs.readFileSync(path.join(env.OUTPUT_DIR, document.id + ".docx")),
    ]);

    const [pdfUploadResponse, docxUploadResponse] = await Promise.all([
        await uploadDocument(document.displayName + ".pdf", PDF_PATH, pdfContent),
        await uploadDocument(document.displayName + ".docx", DOCX_PATH, docxContent),
    ]);

    if (!pdfUploadResponse || !docxUploadResponse) {
        throw new Error("Something went wrong while trying to upload docx and pdf! Please try again.");
    }

    await prisma.document.update({
        where: { id: documentId as string },
        data: { status: "UPLOADED" }
    });

    return response.status(200).json({
        docx: docxUploadResponse, pdf: pdfUploadResponse,
    });
}
