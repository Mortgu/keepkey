import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import {
    removeDocumentArtifacts,
    storeDocumentArtifacts,
    StoredDocumentArtifacts,
} from "../lib/document-artifact-store.js";
import { prisma } from "../lib/prismaClient.js";
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
    document: { id: string; status: DocumentStatus; pdfId: string | null; docxId: string | null },
    type: "OfferDocument" | "OrderDocument",
): boolean {
    if (Boolean(document.pdfId) !== Boolean(document.docxId)) {
        throw new Error(`${type} ${document.id} has incomplete artifact links.`);
    }

    if (document.pdfId && document.docxId) {
        return false;
    }

    if (COMPLETED_DOCUMENT_STATUSES.has(document.status)) {
        throw new Error(`${type} ${document.id} is ${document.status} without complete artifact links.`);
    }

    return true;
}

async function artifactsWereFinalized(
    files: StoredDocumentArtifacts,
    linkedFiles: () => Promise<{ pdf: { filename: string } | null; docx: { filename: string } | null } | null>,
): Promise<boolean> {
    try {
        const linked = await linkedFiles();
        if (
            linked?.pdf?.filename === files.pdf.filename
            && linked.docx?.filename === files.docx.filename
        ) {
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
) {
    const pdf = await tx.document.create({
        data: {
            ...files.pdf,
            format: DocumentFormat.PDF,
        },
    });
    const docx = await tx.document.create({
        data: {
            ...files.docx,
            format: DocumentFormat.DOCX,
        },
    });

    return { pdf, docx };
}

export async function generateOfferDocument(taskId: string): Promise<void> {
    const offerDocument = await prisma.offerDocument.findFirst({
        where: { taskId },
    });

    if (!offerDocument) {
        throw new Error(`OfferDocument for task ${taskId} was not found.`);
    }

    if (!assertDocumentCanBeGenerated(offerDocument, "OfferDocument")) {
        return;
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
        offerDocument.id,
        generated.docxBuffer,
        generated.pdfBuffer,
    );

    try {
        await prisma.$transaction(async (tx) => {
            const { pdf, docx } = await createArtifactDocuments(tx, files);
            const finalized = await tx.offerDocument.updateMany({
                where: {
                    id: offerDocument.id,
                    status: DocumentStatus.PROCESSING,
                },
                data: {
                    pdfId: pdf.id,
                    docxId: docx.id,
                    status: DocumentStatus.GENERATED,
                    displayName: generated.displayName,
                    error: null,
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
                pdf: { select: { filename: true } },
                docx: { select: { filename: true } },
            },
        }));
        if (!finalized) throw error;
    }
}

export async function generateOrderDocument(taskId: string): Promise<void> {
    const orderDocument = await prisma.orderDocument.findFirst({
        where: { taskId },
    });

    if (!orderDocument) {
        throw new Error(`OrderDocument for task ${taskId} was not found.`);
    }

    if (!assertDocumentCanBeGenerated(orderDocument, "OrderDocument")) {
        return;
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
        orderDocument.id,
        generated.docxBuffer,
        generated.pdfBuffer,
    );

    try {
        await prisma.$transaction(async (tx) => {
            const { pdf, docx } = await createArtifactDocuments(tx, files);
            const finalized = await tx.orderDocument.updateMany({
                where: {
                    id: orderDocument.id,
                    status: DocumentStatus.PROCESSING,
                },
                data: {
                    pdfId: pdf.id,
                    docxId: docx.id,
                    status: DocumentStatus.GENERATED,
                    displayName: generated.displayName,
                    error: null,
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
                pdf: { select: { filename: true } },
                docx: { select: { filename: true } },
            },
        }));
        if (!finalized) throw error;
    }
}
