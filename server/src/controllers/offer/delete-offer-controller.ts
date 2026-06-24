import fs from 'fs';
import path from 'path';

import { NextFunction, Request, Response } from 'express';

import { prisma } from "../../lib/prismaClient.js";
import logger from '../../middlewares/logger.js';

export const deleteOfferDocument = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;
    const documentId = request.params.documentId as string;

    const offerDoc = await prisma.offerDocument.findFirst({
        where: { offerId, id: documentId },
        include: { pdf: true, docx: true },
    });

    if (!offerDoc) {
        return response.status(404).json({ message: "Document not found" });
    }

    try {
        for (const file of [offerDoc.pdf, offerDoc.docx]) {
            if (file) {
                await fs.promises.rm(path.join(file.path, file.basename), { force: true });
            }
        }

        await prisma.offerDocument.delete({ where: { id: offerDoc.id } });

        return response.status(200).json({ success: true });
    } catch (exception: any) {
        return response.status(500).json({
            message: "Could not delete document: " + exception.message,
        });
    }
};

export const deleteOffer = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    if (!id) {
        return response.status(400).json({
            message: "Bad request. Missing id!",
            success: false,
        });
    }

    await prisma.offer.findUniqueOrThrow({ where: { id } });
    await prisma.offer.delete({ where: { id } });

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};

export const deleteOfferRevision = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id as string;
    const revisionId = request.params.revisionId as string;

    try {
        await prisma.offerRevision.delete({
            where: { id: revisionId },
        });

        return response.status(200).json({
            message: "Successfully deleted revision!"
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}