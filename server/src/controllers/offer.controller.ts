import { NextFunction, Request, Response } from "express";
import { AppException } from "../lib/exceptions.js";

import * as offerService from "../services/offer.service.js";

/* ========== GET ========== */

export const getOffers = async (request: Request, response: Response) => {
    const result = await offerService.getOffers(request.query);
    return response.status(200).json(result);
};

export const getOfferById = async (request: Request, response: Response) => {
    const offer = await offerService.getOfferById(request.params.id as string);
    return response.status(200).json(offer);
};

export const getOfferRevisions = async (request: Request, response: Response) => {
    const revisions = await offerService.getOfferRevisions(request.params.id as string);
    return response.status(200).json(revisions);
};

export const getNextQuoteId = async (request: Request, response: Response, next: NextFunction) => {
    const quoteId = await offerService.getNextQuoteId();
    return response.status(200).json(quoteId);
};

export const downloadOfferDocument = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;
    const documentId = request.params.documentId as string;
    const format = (request.params.format as string).toLowerCase();

    const download = await offerService.downloadOfferDocument(offerId, documentId, format);

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Disposition", `attachment; filename="${download.downloadName}"`);

    if (download.kind === "stream") {
        download.stream.pipe(response);
        return;
    }

    return response.download(download.filePath, download.downloadName);
};

/* ========== DELETE ========== */

export const deleteOffer = async (request: Request, response: Response) => {
    await offerService.deleteOffer(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};

export const deleteOfferDocument = async (request: Request, response: Response) => {
    await offerService.deleteOfferDocument(
        request.params.id as string,
        request.params.documentId as string,
    );

    return response.status(200).json({ success: true });
};

/* ========== UPDATE ========== */

export const updateOffer = async (request: Request, response: Response) => {
    if (!request.body) {
        throw new AppException("Bad request! Missing body!", 400, "MISSING_BODY");
    }

    const offer = await offerService.updateOffer(
        request.params.id as string,
        request.body,
        request.user!.id,
    );

    return response.status(200).json(offer);
};

/* ========== POST ========== */

export const createOffer = async (request: Request, response: Response) => {
    const offer = await offerService.createOffer(request.body);
    return response.status(200).json(offer);
};

export const createOfferPositions = async (request: Request, response: Response) => {
    const positions = await offerService.createOfferPositions(request.params.id as string, request.body);
    return response.status(200).json(positions);
};

export const createOfferFlatrates = async (request: Request, response: Response) => {
    const flatrates = await offerService.createOfferFlatrates(request.params.id as string, request.body);
    return response.status(200).json(flatrates);
};

export const enqueueGeneration = async (request: Request, response: Response) => {
    const task = await offerService.enqueueGeneration(request.params.id as string);
    return response.status(200).json(task);
};

export const uploadOfferDocument = async (request: Request, response: Response) => {
    const { id, documentId } = request.params;
    const result = await offerService.uploadOfferDocument(id as string, documentId as string);
    return response.status(200).json(result);
};

export const restoreOfferRevision = async (request: Request, response: Response) => {
    const offer = await offerService.restoreOfferRevision(
        request.params.id as string,
        request.params.revisionId as string,
        request.body.expectedVersion,
        request.user!.id,
    );
    return response.status(200).json(offer);
};
