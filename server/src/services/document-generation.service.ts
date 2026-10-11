import { DocumentStatus, Prisma } from "@prisma/client";
import { storeDocumentArtifacts } from "../lib/document-artifact-store.js";
import { prisma } from "../lib/prismaClient.js";
import { renderDocument } from "../lib/render-document.js";
import { buildOffer } from "../pipelines/offer/build-offer.js";
import { buildOrder } from "../pipelines/order/build-order.js";
import { offerTemplateSchema } from "../schemas/templates/offer.template.schema.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
} from "./document-generation.helpers.js";

export async function generateOfferDocument(taskId: string): Promise<void> {
    const offerDocument = await prisma.offerDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { offer: { select: { version: true } }, artifacts: true },
    });

    if (!offerDocument) {
        throw new Error(`OfferDocument for task ${taskId} was not found.`);
    }

    if (!assertDocumentCanBeGenerated(offerDocument, "OfferDocument")) {
        return;
    }
    if (offerDocument.sourceVersion != null && offerDocument.offer.version !== offerDocument.sourceVersion) {
        throw new Error(`OfferDocument ${offerDocument.id} is stale and must be regenerated.`);
    }

    const built = await buildOffer(offerDocument.offerId, offerDocument.version);
    const rendered = await renderDocument(
        "OFFER",
        built.language,
        built.data,
        { documentType: "offer", documentId: offerDocument.id },
        { schema: offerTemplateSchema },
    );

    const files = await storeDocumentArtifacts(
        "offers",
        offerDocument.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${offerDocument.offerId}`}))::text AS "lock"`;
            const source = await tx.offer.findUniqueOrThrow({
                where: { id: offerDocument.offerId },
                select: { version: true },
            });
            if (offerDocument.sourceVersion != null && source.version !== offerDocument.sourceVersion) {
                throw new Error(`OfferDocument ${offerDocument.id} became stale during generation.`);
            }
            await createArtifactDocuments(tx, files, { offerDocumentId: offerDocument.id });
            await tx.offerDocument.updateMany({
                where: { offerId: offerDocument.offerId, isCurrent: true },
                data: { isCurrent: false },
            });
            const finalized = await tx.offerDocument.updateMany({
                where: {
                    id: offerDocument.id,
                    deletedAt: null,
                    status: DocumentStatus.PROCESSING,
                },
                data: {
                    status: DocumentStatus.GENERATED,
                    displayName: built.displayName,
                    model: rendered.model as Prisma.InputJsonValue,
                    error: null,
                    isCurrent: true,
                },
            });

            if (finalized.count !== 1) {
                throw new Error(`OfferDocument ${offerDocument.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => prisma.offerDocument.findUnique({
            where: { id: offerDocument.id },
            select: {
                artifacts: { select: { objectKey: true, format: true } },
            },
        }));
        if (!finalized) throw error;
    }
}

export async function generateOrderDocument(taskId: string): Promise<void> {
    const orderDocument = await prisma.orderDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { order: { select: { version: true } }, artifacts: true },
    });

    if (!orderDocument) {
        throw new Error(`OrderDocument for task ${taskId} was not found.`);
    }

    if (!assertDocumentCanBeGenerated(orderDocument, "OrderDocument")) {
        return;
    }
    if (orderDocument.sourceVersion != null && orderDocument.order.version !== orderDocument.sourceVersion) {
        throw new Error(`OrderDocument ${orderDocument.id} is stale and must be regenerated.`);
    }

    const built = await buildOrder(orderDocument.orderId, orderDocument.version);
    const rendered = await renderDocument(
        "ORDER",
        built.language,
        built.data,
        { documentType: "order", documentId: orderDocument.id },
    );
    const files = await storeDocumentArtifacts(
        "orders",
        orderDocument.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${orderDocument.orderId}`}))::text AS "lock"`;
            const source = await tx.order.findUniqueOrThrow({
                where: { id: orderDocument.orderId },
                select: { version: true },
            });
            if (orderDocument.sourceVersion != null && source.version !== orderDocument.sourceVersion) {
                throw new Error(`OrderDocument ${orderDocument.id} became stale during generation.`);
            }
            await createArtifactDocuments(tx, files, { orderDocumentId: orderDocument.id });
            await tx.orderDocument.updateMany({
                where: { orderId: orderDocument.orderId, isCurrent: true },
                data: { isCurrent: false },
            });
            const finalized = await tx.orderDocument.updateMany({
                where: {
                    id: orderDocument.id,
                    deletedAt: null,
                    status: DocumentStatus.PROCESSING,
                },
                data: {
                    status: DocumentStatus.GENERATED,
                    displayName: built.displayName,
                    model: rendered.model as Prisma.InputJsonValue,
                    error: null,
                    isCurrent: true,
                },
            });

            if (finalized.count !== 1) {
                throw new Error(`OrderDocument ${orderDocument.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => prisma.orderDocument.findUnique({
            where: { id: orderDocument.id },
            select: {
                artifacts: { select: { objectKey: true, format: true } },
            },
        }));
        if (!finalized) throw error;
    }
}