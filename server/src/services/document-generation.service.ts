import type { DocumentFormat, DocumentStatus } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import { buildOffer } from "../pipelines/offer/build-offer.js";
import { buildOrder } from "../pipelines/order/build-order.js";
import { offerTemplateSchema } from "../schemas/templates/offer.template.schema.js";
import { runGeneration, type GenerationAdapter } from "./document-generation.js";
import { requireOwner } from "./document-generation.helpers.js";

type OfferDocumentForGeneration = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    offerId: string;
    version: number;
    offer: { version: number };
    artifacts: { format: DocumentFormat }[];
};

const offerAdapter: GenerationAdapter<OfferDocumentForGeneration> = {
    typeName: "OfferDocument",
    type: "offer",
    findByTask: async (taskId) => requireOwner(await prisma.document.findFirst({
        where: { taskId, type: "OFFER", deletedAt: null },
        include: { offer: { select: { version: true } }, artifacts: true },
    }), "offerId", "offer"),
    currentParentVersion: (doc) => doc.offer.version,
    build: (doc) => buildOffer(doc.offerId, doc.version),
    templateKind: "OFFER",
    renderSchema: offerTemplateSchema,
    ownerKey: (doc) => ({ documentId: doc.id }),
    recheckNotStale: async (tx, doc) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${doc.offerId}`}))::text AS "lock"`;
        const source = await tx.offer.findUniqueOrThrow({
            where: { id: doc.offerId },
            select: { version: true },
        });
        if (source.version !== doc.sourceVersion) {
            throw new Error(`OfferDocument ${doc.id} became stale during generation.`);
        }
    },
    demoteSiblingsWhere: (doc) => ({ offerId: doc.offerId, isCurrent: true }),
};

export async function generateOfferDocument(taskId: string): Promise<void> {
    return runGeneration(taskId, offerAdapter);
}

type OrderDocumentForGeneration = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    orderId: string;
    version: number;
    order: { version: number };
    artifacts: { format: DocumentFormat }[];
};

const orderAdapter: GenerationAdapter<OrderDocumentForGeneration> = {
    typeName: "OrderDocument",
    type: "order",
    findByTask: async (taskId) => requireOwner(await prisma.document.findFirst({
        where: { taskId, type: "ORDER", deletedAt: null },
        include: { order: { select: { version: true } }, artifacts: true },
    }), "orderId", "order"),
    currentParentVersion: (doc) => doc.order.version,
    build: (doc) => buildOrder(doc.orderId, doc.version),
    templateKind: "ORDER",
    ownerKey: (doc) => ({ documentId: doc.id }),
    recheckNotStale: async (tx, doc) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${doc.orderId}`}))::text AS "lock"`;
        const source = await tx.order.findUniqueOrThrow({
            where: { id: doc.orderId },
            select: { version: true },
        });
        if (source.version !== doc.sourceVersion) {
            throw new Error(`OrderDocument ${doc.id} became stale during generation.`);
        }
    },
    demoteSiblingsWhere: (doc) => ({ orderId: doc.orderId, isCurrent: true }),
};

export async function generateOrderDocument(taskId: string): Promise<void> {
    return runGeneration(taskId, orderAdapter);
}
