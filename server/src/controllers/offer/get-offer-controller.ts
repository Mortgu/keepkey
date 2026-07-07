import { NextFunction, Request, Response } from "express";

import * as offerService from "../../services/offer.service.js";

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
