import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { DocumentStatus, Prisma } from "@prisma/client";
import env from "../lib/env.js";
import { AppException } from "../lib/exceptions.js";
import {
    RemoteDocumentArtifact,
    RemoteDocumentConflictError,
    sha256Document,
    uploadDocumentArtifact,
} from "../lib/nextcloud-document-store.js";
import { prisma } from "../lib/prismaClient.js";
import logger from "../middlewares/logger.js";

type LocalDocumentArtifact = {
    id: string;
    filename: string;
    basename: string;
    path: string;
    size: number | null;
    sha256: string | null;
    uploadedAt: Date | null;
    remotePath: string | null;
    remoteEtag: string | null;
};

type UploadableDocument = {
    id: string;
    status: DocumentStatus;
    displayName: string | null;
    updatedAt: Date;
    pdf: LocalDocumentArtifact | null;
    docx: LocalDocumentArtifact | null;
};

export type DocumentUploadResult = {
    pdf: RemoteDocumentArtifact;
    docx: RemoteDocumentArtifact;
};

type UploadConfig = {
    document: UploadableDocument;
    pdfDirectory: string;
    docxDirectory: string;
    claim: (token: string, staleBefore: Date) => Promise<boolean>;
    reload: () => Promise<UploadableDocument | null>;
    finalize: (token: string, result: DocumentUploadResult, hashes: { pdf: string; docx: string }) => Promise<boolean>;
    release: (token: string, error: string) => Promise<void>;
    renew: (token: string) => Promise<void>;
};

const UPLOAD_LEASE_MS = 2 * 60 * 1000;
const UPLOAD_HEARTBEAT_MS = 30 * 1000;

async function removeLocalArtifacts(document: UploadableDocument): Promise<void> {
    const localFiles = [document.pdf, document.docx]
        .filter((artifact): artifact is LocalDocumentArtifact => Boolean(artifact))
        .filter((artifact) => !artifact.remotePath || artifact.filename !== artifact.remotePath)
        .map((artifact) => fs.rm(path.join(artifact.path, artifact.basename), { force: true }));
    const cleanup = await Promise.allSettled(localFiles);
    cleanup.forEach((entry) => {
        if (entry.status === "rejected") logger.warn(entry.reason);
    });
}

function completedArtifact(artifact: LocalDocumentArtifact): RemoteDocumentArtifact {
    if (!artifact.uploadedAt) {
        throw new AppException("Uploaded document is missing upload metadata.", 500, "INVALID_UPLOAD_METADATA");
    }

    return {
        remotePath: artifact.remotePath ?? artifact.filename,
        remoteEtag: artifact.remoteEtag,
        uploadedAt: artifact.uploadedAt,
        size: artifact.size ?? 0,
        sha256: artifact.sha256 ?? "",
    };
}

function completedResult(document: UploadableDocument): DocumentUploadResult | null {
    if (document.status !== DocumentStatus.UPLOADED) return null;
    if (!document.pdf || !document.docx) {
        throw new AppException("Uploaded document has incomplete artifact links.", 500, "INVALID_UPLOAD_METADATA");
    }
    return {
        pdf: completedArtifact(document.pdf),
        docx: completedArtifact(document.docx),
    };
}

async function uploadDocument(config: UploadConfig): Promise<DocumentUploadResult> {
    const alreadyUploaded = completedResult(config.document);
    if (alreadyUploaded) {
        await removeLocalArtifacts(config.document);
        return alreadyUploaded;
    }

    if (!config.document.pdf || !config.document.docx) {
        throw new AppException("Documents not yet generated!", 409, "DOCUMENTS_NOT_GENERATED");
    }

    const token = randomUUID();
    const staleBefore = new Date(Date.now() - UPLOAD_LEASE_MS);
    if (!await config.claim(token, staleBefore)) {
        const current = await config.reload();
        if (current) {
            const completed = completedResult(current);
            if (completed) return completed;
        }
        throw new AppException("Document upload is already in progress.", 409, "DOCUMENT_UPLOAD_IN_PROGRESS");
    }

    const pdfLocalPath = path.join(config.document.pdf.path, config.document.pdf.basename);
    const docxLocalPath = path.join(config.document.docx.path, config.document.docx.basename);

    let uploadedResult: DocumentUploadResult | null = null;
    const heartbeat = setInterval(() => {
        void config.renew(token).catch((error) => logger.error(error));
    }, UPLOAD_HEARTBEAT_MS);
    heartbeat.unref();

    try {
        const [pdfContent, docxContent] = await Promise.all([
            fs.readFile(pdfLocalPath),
            fs.readFile(docxLocalPath),
        ]);

        const hashes = {
            pdf: config.document.pdf.sha256 ?? sha256Document(pdfContent),
            docx: config.document.docx.sha256 ?? sha256Document(docxContent),
        };

        const displayName = config.document.displayName ?? config.document.id;

        const uploads = await Promise.allSettled([
            uploadDocumentArtifact(`${displayName}.pdf`, config.pdfDirectory, pdfContent, hashes.pdf),
            uploadDocumentArtifact(`${displayName}.docx`, config.docxDirectory, docxContent, hashes.docx),
        ]);

        console.log(uploads)

        const rejected = uploads.filter((entry): entry is PromiseRejectedResult => entry.status === "rejected");
        if (rejected.length > 0) {
            const conflict = rejected.find((entry) => entry.reason instanceof RemoteDocumentConflictError);
            if (conflict) throw conflict.reason;
            throw new AggregateError(rejected.map((entry) => entry.reason), "One or more document uploads failed.");
        }
        if (uploads[0].status !== "fulfilled" || uploads[1].status !== "fulfilled") {
            throw new Error("Document uploads did not produce complete results.");
        }
        uploadedResult = {
            pdf: uploads[0].value,
            docx: uploads[1].value,
        };

        if (!await config.finalize(token, uploadedResult, hashes)) {
            throw new Error(`Document ${config.document.id} is no longer owned by this upload attempt.`);
        }

        await removeLocalArtifacts(config.document);

        return uploadedResult;
    } catch (error) {
        if (uploadedResult) {
            const current = await config.reload().catch((reloadError) => {
                logger.error(reloadError);
                return null;
            });
            if (current) {
                const completed = completedResult(current);
                if (
                    completed
                    && completed.pdf.remotePath === uploadedResult.pdf.remotePath
                    && completed.docx.remotePath === uploadedResult.docx.remotePath
                ) {
                    await removeLocalArtifacts(current);
                    return completed;
                }
            }
        }

        const message = error instanceof Error ? error.message : "Document upload failed.";
        await config.release(token, message).catch((releaseError) => logger.error(releaseError));

        if (error instanceof AppException) throw error;
        if (error instanceof RemoteDocumentConflictError) {
            throw new AppException(error.message, 409, "REMOTE_DOCUMENT_CONFLICT");
        }

        logger.error(`Document upload failed: ${message}, ${error}`)
        throw new AppException(`Document upload failed: ${message}`, 500, "DOCUMENT_UPLOAD_FAILED");
    } finally {
        clearInterval(heartbeat);
    }
}

function artifactUpdates(result: DocumentUploadResult, hashes: { pdf: string; docx: string }) {
    return {
        pdf: {
            remotePath: result.pdf.remotePath,
            remoteEtag: result.pdf.remoteEtag,
            uploadedAt: result.pdf.uploadedAt,
            size: result.pdf.size,
            sha256: hashes.pdf,
        },
        docx: {
            remotePath: result.docx.remotePath,
            remoteEtag: result.docx.remoteEtag,
            uploadedAt: result.docx.uploadedAt,
            size: result.docx.size,
            sha256: hashes.docx,
        },
    };
}

async function finalizeOfferUpload(
    tx: Prisma.TransactionClient,
    document: UploadableDocument & { pdf: LocalDocumentArtifact; docx: LocalDocumentArtifact },
    token: string,
    result: DocumentUploadResult,
    hashes: { pdf: string; docx: string },
): Promise<boolean> {
    const finalized = await tx.offerDocument.updateMany({
        where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
        data: { status: DocumentStatus.UPLOADED, uploadToken: null, error: null },
    });
    if (finalized.count !== 1) return false;

    const updates = artifactUpdates(result, hashes);
    await tx.document.update({ where: { id: document.pdf.id }, data: updates.pdf });
    await tx.document.update({ where: { id: document.docx.id }, data: updates.docx });
    return true;
}

async function finalizeOrderUpload(
    tx: Prisma.TransactionClient,
    document: UploadableDocument & { pdf: LocalDocumentArtifact; docx: LocalDocumentArtifact },
    token: string,
    result: DocumentUploadResult,
    hashes: { pdf: string; docx: string },
): Promise<boolean> {
    const finalized = await tx.orderDocument.updateMany({
        where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
        data: { status: DocumentStatus.UPLOADED, uploadToken: null, error: null },
    });
    if (finalized.count !== 1) return false;

    const updates = artifactUpdates(result, hashes);
    await tx.document.update({ where: { id: document.pdf.id }, data: updates.pdf });
    await tx.document.update({ where: { id: document.docx.id }, data: updates.docx });
    return true;
}

const claimableUpload = (staleBefore: Date) => ({
    OR: [
        { status: { in: [DocumentStatus.GENERATED, DocumentStatus.FAILED] }, uploadToken: null },
        { status: DocumentStatus.UPLOADING, updatedAt: { lt: staleBefore } },
    ],
});

export async function uploadOfferDocument(
    offerId: string,
    documentId: string,
): Promise<DocumentUploadResult> {
    const document = await prisma.offerDocument.findFirst({
        where: { id: documentId, offerId },
        include: { pdf: true, docx: true },
    });
    if (!document) throw new AppException("Document not found.", 404, "DOCUMENT_NOT_FOUND");

    return uploadDocument({
        document,
        pdfDirectory: env.NEXTCLOUD_OFFER_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_OFFER_ORIGINAL_PATH,
        claim: async (token, staleBefore) => (await prisma.offerDocument.updateMany({
            where: { id: document.id, ...claimableUpload(staleBefore) },
            data: { status: DocumentStatus.UPLOADING, uploadToken: token, error: null },
        })).count === 1,
        reload: () => prisma.offerDocument.findUnique({
            where: { id: document.id },
            include: { pdf: true, docx: true },
        }),
        finalize: (token, result, hashes) => prisma.$transaction((tx) =>
            finalizeOfferUpload(tx, document as typeof document & { pdf: LocalDocumentArtifact; docx: LocalDocumentArtifact }, token, result, hashes)),
        release: async (token, error) => {
            await prisma.offerDocument.updateMany({
                where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
                data: { status: DocumentStatus.GENERATED, uploadToken: null, error },
            });
        },
        renew: async (token) => {
            await prisma.offerDocument.updateMany({
                where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
                data: { updatedAt: new Date() },
            });
        },
    });
}

export async function uploadOrderDocument(
    orderId: string,
    documentId: string,
): Promise<DocumentUploadResult> {
    const document = await prisma.orderDocument.findFirst({
        where: { id: documentId, orderId },
        include: { pdf: true, docx: true },
    });
    if (!document) throw new AppException("Document not found.", 404, "DOCUMENT_NOT_FOUND");

    return uploadDocument({
        document,
        pdfDirectory: env.NEXTCLOUD_ORDER_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_ORDER_ORIGINAL_PATH,
        claim: async (token, staleBefore) => (await prisma.orderDocument.updateMany({
            where: { id: document.id, ...claimableUpload(staleBefore) },
            data: { status: DocumentStatus.UPLOADING, uploadToken: token, error: null },
        })).count === 1,
        reload: () => prisma.orderDocument.findUnique({
            where: { id: document.id },
            include: { pdf: true, docx: true },
        }),
        finalize: (token, result, hashes) => prisma.$transaction((tx) =>
            finalizeOrderUpload(tx, document as typeof document & { pdf: LocalDocumentArtifact; docx: LocalDocumentArtifact }, token, result, hashes)),
        release: async (token, error) => {
            await prisma.orderDocument.updateMany({
                where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
                data: { status: DocumentStatus.GENERATED, uploadToken: null, error },
            });
        },
        renew: async (token) => {
            await prisma.orderDocument.updateMany({
                where: { id: document.id, status: DocumentStatus.UPLOADING, uploadToken: token },
                data: { updatedAt: new Date() },
            });
        },
    });
}
