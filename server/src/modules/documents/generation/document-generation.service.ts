import { DocumentStatus } from "@prisma/client";
import { storeDocumentArtifacts } from "../storage/artifact-store.js";
import { prisma } from "@/core/prisma.js";
import { OfferPipelineContext } from "@/modules/offers/pipeline/context.js";
import { offerStages } from "@/modules/offers/pipeline/stages.js";
import { OrderPipelineContext } from "@/modules/orders/pipeline/context.js";
import { orderStages } from "@/modules/orders/pipeline/stages.js";
import { runPipeline } from "./pipeline.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
    getGeneratedDocument,
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

    const context = await runPipeline<OfferPipelineContext>({
        offerId: offerDocument.offerId,
        version: offerDocument.version,
        docxBuffer: null,
        pdfBuffer: null,
        displayName: null,
    }, offerStages);

    const generated = getGeneratedDocument(context);

    const files = await storeDocumentArtifacts(
        "offers",
        offerDocument.id,
        generated.docxBuffer,
        generated.pdfBuffer,
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
                    displayName: generated.displayName,
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

    const context = await runPipeline<OrderPipelineContext>({
        orderId: orderDocument.orderId,
        version: orderDocument.version,
        docxBuffer: null,
        pdfBuffer: null,
        displayName: null,
    }, orderStages);
    const generated = getGeneratedDocument(context);
    const files = await storeDocumentArtifacts(
        "orders",
        orderDocument.id,
        generated.docxBuffer,
        generated.pdfBuffer,
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
                    displayName: generated.displayName,
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