import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

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
            offerDocuments: {
                orderBy: {version: "desc" as const},
                include: {
                    document: true,
                },
            },
            offerPositions: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    },
                    contract: {
                        include: {
                            translations: true
                        }
                    },
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
                offerDocuments: {
                    orderBy: {version: "desc" as const},
                    include: {document: true},
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
        orderBy: {version: "desc"},
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

    const offerDoc = await prisma.offerDocument.findFirst({
        where: {offerId, documentId},
        include: {document: true},
    });

    if (!offerDoc) {
        return response.status(404).json({message: "Document not found"});
    }

    const {document} = offerDoc;

    if (document.status !== "GENERATED" || !document.path) {
        return response.status(409).json({message: "Document not yet generated"});
    }

    const downloadName = `${document.displayName ?? document.id}.${document.format.toLowerCase()}`;
    return response.download(document.path, downloadName);
};
