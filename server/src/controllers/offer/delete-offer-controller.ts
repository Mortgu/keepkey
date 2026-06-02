import fs from 'fs';
import path from "path";

import {Request, Response} from 'express';

import {prisma} from "../../lib/prismaClient.js";
import env from '../../lib/env.js';

export const deleteOfferDocument = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;
    const documentId = request.params.documentId as string;

    const document = await prisma.document.findFirst({
        where: {id: documentId, offerId},
        select: {id: true},
    });

    if (!document) {
        return response.status(404).json({message: "Document not found"});
    }

    try {
        await prisma.document.delete({where: {id: document.id}});

        for (const ext of ["pdf", "docx"]) {
            const filePath = path.join(env.OUTPUT_DIR, `${document.id}.${ext}`);
            await fs.promises.rm(filePath, {force: true});
        }

        return response.status(200).json({success: true});
    } catch (exception: any) {
        return response.status(500).json({
            message: "Could not delete document: " + exception.message,
        });
    }
};

export const deleteOffer = async (request: Request, response: Response) => {
    const {id} = request.params;

    if (!id) {
        return response.status(400).json({
            message: "Bad request. Missing id!",
            success: false,
        });
    }

    const offer = await prisma.offer.findUniqueOrThrow({
        where: {id: id as string}
    });

    const reservationFiles: string[] = offer.reservationFile;

    for (const reservationFile of reservationFiles) {

    }

    await prisma.offer.delete({
        where: {id: id as string},
    });

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};