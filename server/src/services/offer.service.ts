import fs from "fs";
import path from "path";
import { Readable } from "stream";
import z from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { downloadDocumentStream } from "../lib/nextcloud.js";
import { uploadOfferDocument as uploadOfferDocumentUseCase } from "./document-upload.service.js";
import { requestOfferGeneration } from "./document-generation-request.service.js";
import { generateOfferDisplayName } from "../utils/documents.js";
import { pickTranslation } from "../utils/i18n.js";
import { calculatePrice } from "../utils/products.js";
import { toDate } from "../utils/utils.js";
import {
    createOfferFieldsSchema,
    createOfferFlatratesSchema,
    createOfferPositionsSchema,
    createOfferSchema,
    updateOfferSchema,
} from "../schemas/offer-schemas.js";

/* ========== Types ========== */

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type CreateOfferFieldsInput = z.infer<typeof createOfferFieldsSchema>;
export type PositionInput = z.infer<typeof createOfferPositionsSchema>[number];
export type FlatrateInput = z.infer<typeof createOfferFlatratesSchema>[number];

type PricedPosition = PositionInput & {
    total_cents: number;
    eur_user_month: number;
    discount_cents: number;
};
type PricedFlatrate = FlatrateInput & { total_cents: number };

export interface OfferListQuery {
    search?: unknown;
    companyIds?: unknown;
    contactPersonIds?: unknown;
    sort?: unknown;
    cursor?: unknown;
    limit?: unknown;
}

export type OfferDocumentDownload =
    | { kind: "stream"; stream: Readable; contentType: string; downloadName: string }
    | { kind: "file"; filePath: string; contentType: string; downloadName: string };

const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/* ========== Helpers ========== */

/** Berechnet total_cents für jede Position über den Tarif (wirft AppException, wenn kein Preis ermittelbar). */
async function pricePositions(positions: PositionInput[], customerId?: string): Promise<PricedPosition[]> {
    const priced: PricedPosition[] = [];

    for (const position of positions) {
        try {
            const result = await calculatePrice({
                productId: position.productId,
                contractId: position.contractId,
                duration: position.duration_months,
                quantity: position.quantity,
                customerId,
                freeMonths: 0,
            });

            if (!result.ok) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: ${result.reason}`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const eur_user_month = result.breakdown.unitPrice;
            const discount_cents = eur_user_month * position.quantity * (position.free_months ?? 0);

            priced.push({ ...position, total_cents: result.price, eur_user_month, discount_cents });
        } catch (exception: any) {
            if (exception instanceof AppException) throw exception;
            throw new AppException(
                `Price calculation failed for product ${position.productId}: ${exception.message}`,
                422,
                "PRICE_CALCULATION_FAILED",
            );
        }
    }

    return priced;
}

/** Lädt die total_cents aller angefragten FlatRates als Map (id → cents). */
async function getFlatRateCentsById(flatRateIds: string[]): Promise<Map<string, number>> {
    const rates = await prisma.flatRate.findMany({
        where: { id: { in: flatRateIds } },
        select: { id: true, total_cents: true },
    });

    return new Map(rates.map((r) => [r.id, r.total_cents]));
}

/** Berechnet total_cents (= rate * quantity) für jede Flatrate. */
async function priceFlatrates(flatrates: FlatrateInput[]): Promise<PricedFlatrate[]> {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId));

    return flatrates.map((flatrate) => {
        const rate_cents = rateById.get(flatrate.flatRateId);
        if (rate_cents === undefined) {
            throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
        }

        return { ...flatrate, total_cents: rate_cents * flatrate.quantity };
    });
}

/** Mapped die Scalar-Felder eines Offers auf Prisma-Datentypen (Datumsfelder, nullables). */
function mapOfferData<T extends { supplierId?: string | null; validUntil?: string | null; requestFrom?: string | null; date?: string | null }>(fields: T) {
    const { supplierId, validUntil, requestFrom, date, ...rest } = fields;

    return {
        ...rest,
        date: toDate(date) ?? new Date(),
        supplierId: supplierId || null,
        validUntil: toDate(validUntil),
        requestFrom: toDate(requestFrom),
    };
}

/** Summiert Positionen + Flatrates neu und schreibt net_amount am Offer. */
async function recomputeNetAmount(tx: Prisma.TransactionClient, offerId: string): Promise<void> {
    const [positionsSum, positionsDiscountSum, flatratesSum] = await Promise.all([
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { discount_cents: true },
        }),
        tx.offerFlatRate.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
    ]);

    const positionsNet = (positionsSum._sum.total_cents ?? 0) - (positionsDiscountSum._sum.discount_cents ?? 0);

    await tx.offer.update({
        where: { id: offerId },
        data: {
            net_amount: positionsNet + (flatratesSum._sum.total_cents ?? 0),
        },
    });
}

async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: PricedPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, contractId, duration_months, free_months, quantity, optional, eur_user_month, total_cents, discount_cents }) => ({
            offerId, productId, contractId, duration_months, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
        })),
    });
}

async function replaceFlatRates(tx: Prisma.TransactionClient, offerId: string, flatRates: PricedFlatrate[]) {
    await tx.offerFlatRate.deleteMany({ where: { offerId } });
    await tx.offerFlatRate.createMany({
        data: flatRates.map(({ flatRateId, quantity, total_cents }) => ({
            offerId, flatRateId, quantity, total_cents,
        })),
    });
}

/* ========== Queries ========== */

export async function getOffers(query: OfferListQuery) {
    const { search, companyIds, contactPersonIds, sort, cursor } = query;

    const limitRaw = Number(query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.trunc(limitRaw), 100)
        : 50;

    const where: {
        quoteId?: { contains: string };
        customerId?: { in: string[] };
        contactPersonId?: { in: string[] };
    } = {};

    if (search && typeof search === "string") {
        where.quoteId = { contains: search };
    }

    if (companyIds) {
        const ids = Array.isArray(companyIds) ? companyIds : [companyIds];
        where.customerId = { in: ids as string[] };
    }

    if (contactPersonIds) {
        const ids = Array.isArray(contactPersonIds) ? contactPersonIds : [contactPersonIds];
        where.contactPersonId = { in: ids as string[] };
    }

    const orderBy = sort === "createdAt:asc" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

    const items = await prisma.offer.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor && typeof cursor === "string" ? { id: cursor } : undefined,
        include: {
            customer: { select: { id: true, companyName: true } },
            customerContactPerson: { select: { id: true, salutation: true, firstName: true, lastName: true } },
            revisions: {
                orderBy: { version: "desc" },
                select: {
                    id: true,
                    version: true,
                    createdAt: true,
                    changedBy: { select: { id: true, name: true } },
                },
            },
            offerDocuments: {
                include: {
                    docx: true,
                    pdf: true
                }
            },
            offerPositions: {
                include: {
                    product: {
                        include: { translations: true }
                    },
                    contract: {
                        include: { translations: true }
                    }
                }
            },
            offerFlatRates: {
                include: {
                    flatRate: {
                        include: { translations: true }
                    }
                }
            },
        },
    });

    const nextCursor = items.length === limit ? items[items.length - 1]?.id ?? null : null;

    return { items, nextCursor };
}

export async function getOfferById(id: string) {
    const offer = await prisma.offer.findFirst({
        where: { id },
        include: {
            offerDocuments: {
                orderBy: { version: "desc" as const },
                include: {
                    pdf: true,
                    docx: true,
                    task: true,
                },
            },
            offerPositions: {
                include: {
                    product: {
                        include: { translations: true }
                    },
                    contract: {
                        include: { translations: true }
                    }
                }
            },
            offerFlatRates: true
        },
    });

    if (!offer) {
        throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
    }

    return offer;
}

export async function getOfferRevisions(offerId: string) {
    return prisma.offerRevision.findMany({
        where: { offerId },
        orderBy: { version: "desc" },
        select: { id: true, version: true, changedBy: true, createdAt: true },
    });
}

export async function getNextQuoteId(): Promise<number> {
    const quoteId = 0; //await getLatestQuoteId();
    return quoteId + 1;
}

export async function downloadOfferDocument(offerId: string, documentId: string, format: string): Promise<OfferDocumentDownload> {
    if (format !== "pdf" && format !== "docx") {
        throw new AppException("Invalid format. Use 'pdf' or 'docx'.", 400, "INVALID_FORMAT");
    }

    const offerDoc = await prisma.offerDocument.findFirst({
        where: { offerId, id: documentId },
        include: { pdf: true, docx: true },
    });

    if (!offerDoc) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    if (offerDoc.status !== "GENERATED" && offerDoc.status !== "UPLOADED") {
        throw new AppException("Document not yet generated", 409, "DOCUMENT_NOT_GENERATED");
    }

    const file = format === "pdf" ? offerDoc.pdf : offerDoc.docx;
    if (!file) {
        throw new AppException("File not found", 404, "FILE_NOT_FOUND");
    }

    const contentType = MIME_TYPES[format]!;
    const downloadName = `${offerDoc.displayName ?? offerDoc.id}.${format}`;

    if (offerDoc.status === "UPLOADED") {
        try {
            const stream = await downloadDocumentStream(file.remotePath ?? file.filename);
            return { kind: "stream", stream, contentType, downloadName };
        } catch (exception: any) {
            if (exception instanceof AppException) throw exception;
            throw new AppException(
                "Failed to download from Nextcloud: " + exception.message,
                500,
                "NEXTCLOUD_DOWNLOAD_FAILED",
            );
        }
    }

    const filePath = path.join(file.path, file.basename);

    try {
        await fs.promises.access(filePath);
    } catch {
        throw new AppException("File not found on disk", 404, "FILE_NOT_FOUND_ON_DISK");
    }

    return { kind: "file", filePath, contentType, downloadName };
}

/* ========== Mutations ========== */

export async function createOffer(input: CreateOfferInput) {
    const positions = await pricePositions(input.positions, input.offer.customerId);
    const flatrates = await priceFlatrates(input.flatrates);

    return prisma.$transaction(async (tx) => {
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0);

        const offer = await tx.offer.create({
            data: {
                ...mapOfferData(input.offer),
                net_amount,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, contractId, duration_months, free_months, quantity, optional, eur_user_month, total_cents, discount_cents }) => ({
                offerId: offer.id, productId, contractId, duration_months, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
            })),
        });

        await tx.offerFlatRate.createMany({
            data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                offerId: offer.id, flatRateId, quantity, total_cents,
            })),
        });

        return offer;
    });
}

export async function updateOffer(offerId: string, input: UpdateOfferInput, actorId: string) {
    const { positions: rawPositions = [], flatrates: rawFlatrates = [] } = input;
    const { id: _, ...offerFields } = (input.offer ?? {}) as CreateOfferFieldsInput & { id?: string };

    const positions = await pricePositions(rawPositions, input.offer?.customerId);
    const flatrates = await priceFlatrates(rawFlatrates);

    return prisma.$transaction(async (tx) => {
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0);

        const current = await tx.offer.findFirstOrThrow({
            where: { id: offerId },
            include: {
                offerPositions: true,
                offerFlatRates: true
            },
        });

        await tx.offerRevision.create({
            data: {
                offerId,
                version: current.version,
                changedById: actorId,
                snapshot: current as any,
            },
        });

        const [offer] = await tx.offer.updateManyAndReturn({
            where: { id: offerId },
            data: {
                ...mapOfferData(offerFields),
                net_amount,
                version: { increment: 1 },
            },
        });

        await replacePositions(tx, offerId, positions);
        await replaceFlatRates(tx, offerId, flatrates);

        return offer;
    });
}

export async function createOfferPositions(offerId: string, positions: PositionInput[]) {
    const priced = await pricePositions(positions);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.offerPosition.createManyAndReturn({
            data: priced.map((position) => ({ offerId, ...position })),
        });

        await recomputeNetAmount(tx, offerId);

        return created;
    });


}

export async function createOfferFlatrates(offerId: string, flatrates: FlatrateInput[]) {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId));

    return prisma.$transaction(async (tx) => {
        const created = await tx.offerFlatRate.createManyAndReturn({
            data: flatrates.map((flatrate) => {
                const rate_cents = rateById.get(flatrate.flatRateId);
                if (rate_cents === undefined) {
                    throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
                }

                return {
                    offerId,
                    ...flatrate,
                    total_cents: rate_cents,
                };
            }),
        });

        await recomputeNetAmount(tx, offerId);

        return created;
    });
}

/* ========== Documents ========== */

export async function enqueueGeneration(offerId: string) {
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

    const formatedWorkloads = offer.offerPositions.map((op) => (
        pickTranslation(op.product.translations, offer.language)?.name ?? ""
    ).replaceAll(" ", "").trim());

    return requestOfferGeneration(offerId, (version) => generateOfferDisplayName(
        offer.quoteId,
        offer.customer.companyName,
        formatedWorkloads,
        version,
    ));
}

export async function uploadOfferDocument(offerId: string, documentId: string) {
    return uploadOfferDocumentUseCase(offerId, documentId);
}

/* ========== Deletes ========== */

export async function deleteOffer(id: string): Promise<void> {
    if (!id) {
        throw new AppException("Bad request. Missing id!", 400, "MISSING_ID");
    }

    await prisma.offer.findUniqueOrThrow({ where: { id } });
    await prisma.offer.delete({ where: { id } });
}

export async function deleteOfferDocument(offerId: string, documentId: string): Promise<void> {
    const offerDoc = await prisma.offerDocument.findFirst({
        where: { offerId, id: documentId },
        include: { pdf: true, docx: true },
    });

    if (!offerDoc) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    for (const file of [offerDoc.pdf, offerDoc.docx]) {
        if (file) {
            await fs.promises.rm(path.join(file.path, file.basename), { force: true });
        }
    }

    await prisma.offerDocument.delete({ where: { id: offerDoc.id } });
}

export async function deleteOfferRevision(revisionId: string): Promise<void> {
    await prisma.offerRevision.delete({
        where: { id: revisionId },
    });
}
