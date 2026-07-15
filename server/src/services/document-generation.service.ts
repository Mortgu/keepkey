import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import {
    removeDocumentArtifacts,
    storeDocumentArtifacts,
    StoredDocumentArtifacts,
} from "../lib/document-artifact-store.js";
import { prisma } from "../lib/prismaClient.js";
import { artifactPair } from "../lib/document-artifacts.js";
import { OfferPipelineContext } from "../pipelines/offer/context.js";
import { offerStages } from "../pipelines/offer/stages.js";
import { OrderPipelineContext } from "../pipelines/order/context.js";
import { orderStages } from "../pipelines/order/stages.js";
import { PipelineContext, PipelineStageError, runPipeline } from "../pipelines/pipeline.js";
import logger from "../middlewares/logger.js";

type GeneratedDocument = {
    displayName: string;
    docxBuffer: Buffer;
    pdfBuffer: Buffer;
};

const COMPLETED_DOCUMENT_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADING,
    DocumentStatus.UPLOADED,
]);

function assertDocumentCanBeGenerated(
    document: { id: string; status: DocumentStatus; artifacts: { format: DocumentFormat }[] },
    type: "OfferDocument" | "OrderDocument",
): boolean {
    const { pdf, docx } = artifactPair(document.artifacts);
    if (Boolean(pdf) !== Boolean(docx)) {
        throw new Error(`${type} ${document.id} has incomplete artifact links.`);
    }

    if (pdf && docx) {
        return false;
    }

    if (COMPLETED_DOCUMENT_STATUSES.has(document.status)) {
        throw new Error(`${type} ${document.id} is ${document.status} without complete artifact links.`);
    }

    return true;
}

async function artifactsWereFinalized(
    files: StoredDocumentArtifacts,
    linkedFiles: () => Promise<{ artifacts: { objectKey: string; format: DocumentFormat }[] } | null>,
): Promise<boolean> {
    try {
        const linked = await linkedFiles();
        const linkedArtifacts = artifactPair(linked?.artifacts ?? []);
        if (linkedArtifacts.pdf?.objectKey === files.pdf.objectKey
            && linkedArtifacts.docx?.objectKey === files.docx.objectKey) {
            return true;
        }
    } catch (verificationError) {
        logger.error(verificationError);
        return false;
    }

    try {
        await removeDocumentArtifacts(files);
    } catch (cleanupError) {
        logger.error(cleanupError);
    }
    return false;
}

function getGeneratedDocument(context: PipelineContext): GeneratedDocument {
    if (!context.displayName || !context.docxBuffer || !context.pdfBuffer) {
        throw new PipelineStageError(
            "Pipeline completed without a display name, DOCX buffer, or PDF buffer.",
        );
    }

    return {
        displayName: context.displayName,
        docxBuffer: context.docxBuffer,
        pdfBuffer: context.pdfBuffer,
    };
}

async function createArtifactDocuments(
    tx: Prisma.TransactionClient,
    files: StoredDocumentArtifacts,
    owner: { offerDocumentId: string } | { orderDocumentId: string },
) {
    const pdf = await tx.documentArtifact.create({
        data: {
            ...files.pdf,
            format: DocumentFormat.PDF,
            ...owner,
        },
    });
    const docx = await tx.documentArtifact.create({
        data: {
            ...files.docx,
            format: DocumentFormat.DOCX,
            ...owner,
        },
    });

    return { pdf, docx };
}

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
