import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";

/* ========== Types ========== */

export type RenameDocumentInput = { displayName: string };

/* ========== Mutations ========== */

export async function renameDocument(id: string, input: RenameDocumentInput) {
    const { displayName } = input;

    return prisma.offerDocument.update({
        where: { id, deletedAt: null },
        data: { displayName },
    });
}

/* ========== Deletes ========== */

export async function deleteDocument(id: string): Promise<void> {
    const artifact = await prisma.document.findUnique({
        where: { id },
        select: {
            offerPdfDocument: { select: { id: true, status: true, deletedAt: true } },
            offerDocxDocument: { select: { id: true, status: true, deletedAt: true } },
            orderPdfDocument: { select: { id: true, status: true, deletedAt: true } },
            orderDocxDocument: { select: { id: true, status: true, deletedAt: true } },
        },
    });
    if (!artifact) throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");

    const offerDocument = artifact.offerPdfDocument ?? artifact.offerDocxDocument;
    const orderDocument = artifact.orderPdfDocument ?? artifact.orderDocxDocument;
    const document = offerDocument ?? orderDocument;
    if (!document || document.deletedAt) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }
    if (["PENDING", "PROCESSING", "UPLOADING"].includes(document.status)) {
        throw new AppException(
            "A document cannot be deleted while processing.",
            409,
            "DOCUMENT_PROCESSING",
        );
    }

    let deleted;
    if (offerDocument) {
        deleted = await prisma.offerDocument.updateMany({
            where: {
                id: offerDocument.id,
                deletedAt: null,
                status: { notIn: ["PENDING", "PROCESSING", "UPLOADING"] },
            },
            data: { deletedAt: new Date(), isCurrent: false },
        });
    } else if (orderDocument) {
        deleted = await prisma.orderDocument.updateMany({
            where: {
                id: orderDocument.id,
                deletedAt: null,
                status: { notIn: ["PENDING", "PROCESSING", "UPLOADING"] },
            },
            data: { deletedAt: new Date(), isCurrent: false },
        });
    }
    if (!deleted || deleted.count !== 1) {
        throw new AppException(
            "A document cannot be deleted while processing.",
            409,
            "DOCUMENT_PROCESSING",
        );
    }
}
