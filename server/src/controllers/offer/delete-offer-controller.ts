import fs from 'fs';

import { Request, Response } from 'express';

import { prisma } from "../../lib/prismaClient.js";

export const deleteOfferDocument = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;
    const documentId = request.params.documentId as string;

    const offerDoc = await prisma.offerDocument.findFirst({
        where: { offerId, documentId },
        include: { document: true },
    });

    if (!offerDoc) {
        return response.status(404).json({ message: "Document not found" });
    }

    try {
        await prisma.document.delete({ where: { id: offerDoc.documentId } });

        if (offerDoc.document.path) {
            await fs.promises.rm(offerDoc.document.path, { force: true });
        }

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
