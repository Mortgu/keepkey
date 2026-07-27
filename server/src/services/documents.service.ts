import { DocumentFormat, DocumentStatus } from "@prisma/client";
import { findArtifact } from "../lib/document-artifacts.js";
import { getDocumentDownloadUrl } from "../lib/document-artifact-store.js";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import type {
    DocumentFormatParam,
    DocumentType,
} from "../schemas/document-schemas.js";
import { uploadGeneratedDocument } from "./document-upload.service.js";

export type RenameDocumentInput = { displayName: string };

const DOWNLOADABLE_STATUSES = new Set<DocumentStatus>([
    DocumentStatus.GENERATED,
    DocumentStatus.UPLOADING,
    DocumentStatus.UPLOADED,
]);
const RENAMABLE_STATUSES = [DocumentStatus.GENERATED, DocumentStatus.UPLOADED];
const MIME_TYPES: Record<DocumentFormatParam, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

async function findGeneratedDocument(type: DocumentType, id: string) {
    return type === "offer"
        ? prisma.offerDocument.findFirst({
            where: { id, deletedAt: null },
            include: { artifacts: true },
        })
        : prisma.orderDocument.findFirst({
            where: { id, deletedAt: null },
            include: { artifacts: true },
        });
}

async function requireGeneratedDocument(type: DocumentType, id: string) {
    const document = await findGeneratedDocument(type, id);
    if (!document) {
        throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }
    return document;
}

export async function renameDocument(
    type: DocumentType,
    id: string,
    input: RenameDocumentInput,
) {
    await requireGeneratedDocument(type, id);
    const where = {
        id,
        deletedAt: null,
        status: { in: RENAMABLE_STATUSES },
    };
    const data = { displayName: input.displayName };
    const renamed = type === "offer"
        ? await prisma.offerDocument.updateMany({ where, data })
        : await prisma.orderDocument.updateMany({ where, data });

    if (renamed.count !== 1) {
        throw new AppException(
            "Only generated or uploaded documents can be renamed.",
            409,
            "DOCUMENT_NOT_RENAMABLE",
        );
    }

    return requireGeneratedDocument(type, id);
}

export async function deleteDocument(type: DocumentType, id: string): Promise<void> {
    await requireGeneratedDocument(type, id);
    const where = {
        id,
        deletedAt: null,
        status: { notIn: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.UPLOADING] },
    };
    const data = { deletedAt: new Date(), isCurrent: false };
    const deleted = type === "offer"
        ? await prisma.offerDocument.updateMany({ where, data })
        : await prisma.orderDocument.updateMany({ where, data });

    if (deleted.count !== 1) {
        throw new AppException(
            "A document cannot be deleted while processing.",
            409,
            "DOCUMENT_PROCESSING",
        );
    }
}

export async function downloadDocument(
    type: DocumentType,
    id: string,
    format: DocumentFormatParam,
): Promise<{ url: string }> {
    const document = await requireGeneratedDocument(type, id);
    if (!DOWNLOADABLE_STATUSES.has(document.status)) {
        throw new AppException("Document not yet generated", 409, "DOCUMENTS_NOT_GENERATED");
    }

    const artifactFormat = format === "pdf" ? DocumentFormat.PDF : DocumentFormat.DOCX;
    const artifact = findArtifact(document.artifacts, artifactFormat);
    if (!artifact) throw new AppException("File not found", 404, "FILE_NOT_FOUND");

    return {
        url: await getDocumentDownloadUrl(
            artifact.objectKey,
            `${document.displayName ?? document.id}.${format}`,
            MIME_TYPES[format],
        ),
    };
}

export function uploadDocument(type: DocumentType, id: string) {
    return uploadGeneratedDocument(type, id);
}
