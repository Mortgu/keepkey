import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";
import path from "path";
import env from '../../lib/env.js';

export const getOffers = async (request: Request, response: Response) => {
    const {search, companyIds, contactPersonIds, sort} = request.query;

    const where: {
        AND?: any[];
        quoteId?: { contains: string };
        customerId?: { in: string[] };
        contactPersonId?: { in: string[] };
    } = {};

    if (search && typeof search === "string") {
        where.quoteId = {contains: search};
    }

    if (companyIds) {
        const ids = Array.isArray(companyIds) ? companyIds : [companyIds];
        where.customerId = {in: ids as string[]};
    }

    if (contactPersonIds) {
        const ids = Array.isArray(contactPersonIds) ? contactPersonIds : [contactPersonIds];
        where.contactPersonId = {in: ids as string[]};
    }

    const orderBy = sort === "createdAt:asc" ? {createdAt: "asc" as const} : {createdAt: "desc" as const};

    const offers = await prisma.offer.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
        include: {
            customer: true,
            supplier: true,
            customerContactPerson: true,
            reservationTask: true,
            documents: {
                orderBy: {createdAt: 'desc' as const},
                include: {task: true},
            },
            offerPositions: {
                include: {
                    product: true,
                    contract: true,
                },
            },
            offerFlatRates: {
                include: {
                    flatRate: true,
                },
            },
        },
    });

    return response.status(200).json(offers);
};

export const getOfferById = async (request: Request, response: Response) => {
    const {id} = request.params;

    try {
        const offer = await prisma.offer.findFirstOrThrow({
            where: {id: id as string},
            include: {
                reservationTask: true,
                documents: {
                    orderBy: {createdAt: 'desc'},
                    include: {task: true},
                },
            },
        });

        return response.status(200).json(offer);
    } catch (exception: any) {
        return response.status(404).json({
            message: "Offer not found!",
        });
    }
};

export const getOfferRevisions = async (request: Request, response: Response) => {
    const {id} = request.params;

    const revisions = await prisma.offerRevision.findMany({
        where: {offerId: id as string},
        orderBy: {version: 'desc'},
        select: {id: true, version: true, changedBy: true, createdAt: true},
    });

    return response.status(200).json(revisions);
};

export const getNextQuoteId = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const quoteId = 0; //await getLatestQuoteId();
        return response.status(200).json(quoteId + 1);
    } catch (exception: any) {
        return next(exception);
    }
};


export const downloadOfferDocument = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;
    const documentId = request.params.documentId as string;
    const format = request.params.format as string;

    if (format !== "pdf" && format !== "docx") {
        return response.status(400).json({message: "Invalid format"});
    }

    const document = await prisma.document.findFirst({
        where: {id: documentId, offerId},
        select: {
            id: true,
            displayName: true,
            pdfReady: true,
            docxReady: true,
        },
    });

    if (!document) {
        return response.status(404).json({message: "Document not found"});
    }

    const ready = format === "pdf" ? document.pdfReady : document.docxReady;
    if (!ready) {
        return response.status(409).json({message: "Document not yet generated"});
    }

    const filePath = path.join(env.OUTPUT_DIR, `${document.id}.${format}`);
    const downloadName = `${document.displayName ?? document.id}.${format}`;

    return response.download(filePath, downloadName);
};

