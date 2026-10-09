import { randomUUID } from "crypto";
import { DocumentFormat, DocumentStatus, Prisma } from "@prisma/client";
import { getDocumentArtifact } from "./storage/artifact-store.js";
import { artifactPair } from "./storage/artifacts.js";
import { AppException } from "@/core/exceptions.js";
import {
    RemoteDocumentArtifact,
    RemoteDocumentConflictError,
    sha256Document,
    uploadDocumentArtifact,
} from "./storage/nextcloud-store.js";
import { prisma } from "@/core/prisma.js";
import logger from "@/core/logger.js";
import type { DocumentType } from "@keepit/schemas";
import { documentTable } from "./document-repo.js";

type StoredDocumentArtifact = {
    id: string;
    format: DocumentFormat;
    objectKey: string;
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
    artifacts: StoredDocumentArtifact[];
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
    finalize: (
        document: UploadableDocument,
        token: string,
        result: DocumentUploadResult,
        hashes: { pdf: string; docx: string },
    ) => Promise<boolean>;
    release: (token: string, error: string) => Promise<void>;
    renew: (token: string) => Promise<void>;
};

const UPLOAD_LEASE_MS = 2 * 60 * 1000;
const UPLOAD_HEARTBEAT_MS = 30 * 1000;

function completedArtifact(artifact: StoredDocumentArtifact): RemoteDocumentArtifact {
    if (!artifact.uploadedAt || !artifact.remotePath) {
        throw new AppException("Uploaded document is missing upload metadata.", 500, "INVALID_UPLOAD_METADATA");
    }

    return {
        remotePath: artifact.remotePath,
        remoteEtag: artifact.remoteEtag,
        uploadedAt: artifact.uploadedAt,
        size: artifact.size ?? 0,
        sha256: artifact.sha256 ?? "",
    };
}

function completedResult(document: UploadableDocument): DocumentUploadResult | null {
    if (document.status !== DocumentStatus.UPLOADED) return null;
    const { pdf, docx } = artifactPair(document.artifacts);
    if (!pdf || !docx) {
        throw new AppException("Uploaded document has incomplete artifact links.", 500, "INVALID_UPLOAD_METADATA");
    }
    return {
        pdf: completedArtifact(pdf),
        docx: completedArtifact(docx),
    };
}

async function uploadDocument(config: UploadConfig): Promise<DocumentUploadResult> {
    const alreadyUploaded = completedResult(config.document);
    if (alreadyUploaded) {
        return alreadyUploaded;
    }

    const initialArtifacts = artifactPair(config.document.artifacts);
    if (!initialArtifacts.pdf || !initialArtifacts.docx) {
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

    let claimedDocument: UploadableDocument | null;
    try {
        claimedDocument = await config.reload();
    } catch (error) {
        await config.release(token, "Failed to reload claimed document.").catch((releaseError) => logger.error(releaseError));
        throw error;
    }
    if (!claimedDocument || claimedDocument.status !== DocumentStatus.UPLOADING) {
        await config.release(token, "Document upload lease was lost.").catch((releaseError) => logger.error(releaseError));
        throw new AppException("Document upload lease was lost.", 409, "DOCUMENT_UPLOAD_LEASE_LOST");
    }
    const { pdf, docx } = artifactPair(claimedDocument.artifacts);
    if (!pdf || !docx) {
        await config.release(token, "Documents not yet generated.");
        throw new AppException("Documents not yet generated!", 409, "DOCUMENTS_NOT_GENERATED");
    }

    let uploadedResult: DocumentUploadResult | null = null;
    const heartbeat = setInterval(() => {
        void config.renew(token).catch((error) => logger.error(error));
    }, UPLOAD_HEARTBEAT_MS);
    heartbeat.unref();

    try {
        const [pdfContent, docxContent] = await Promise.all([
            getDocumentArtifact(pdf.objectKey),
            getDocumentArtifact(docx.objectKey),
        ]);

        const hashes = {
            pdf: pdf.sha256 ?? sha256Document(pdfContent),
            docx: docx.sha256 ?? sha256Document(docxContent),
        };

        const displayName = claimedDocument.displayName ?? claimedDocument.id;

        const uploads = await Promise.allSettled([
            uploadDocumentArtifact(`${displayName}.pdf`, config.pdfDirectory, pdfContent, hashes.pdf),
            uploadDocumentArtifact(`${displayName}.docx`, config.docxDirectory, docxContent, hashes.docx),
        ]);

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

        if (!await config.finalize(claimedDocument, token, uploadedResult, hashes)) {
            throw new Error(`Document ${claimedDocument.id} is no longer owned by this upload attempt.`);
        }

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

/**
 * `remoteSha256` hält fest, welcher Inhalt tatsächlich auf Nextcloud liegt.
 * Solange nichts ersetzt wird, ist er mit `sha256` identisch; nach einem
 * Ersetzen in S3 laufen die beiden auseinander und genau daran erkennt die
 * Oberfläche den veralteten Stand.
 */
function artifactUpdates(result: DocumentUploadResult, hashes: { pdf: string; docx: string }) {
    return {
        pdf: {
            remotePath: result.pdf.remotePath,
            remoteEtag: result.pdf.remoteEtag,
            uploadedAt: result.pdf.uploadedAt,
            size: result.pdf.size,
            sha256: hashes.pdf,
            remoteSha256: hashes.pdf,
        },
        docx: {
            remotePath: result.docx.remotePath,
            remoteEtag: result.docx.remoteEtag,
            uploadedAt: result.docx.uploadedAt,
            size: result.docx.size,
            sha256: hashes.docx,
            remoteSha256: hashes.docx,
        },
    };
}

async function finalizeUpload(
    type: DocumentType,
    tx: Prisma.TransactionClient,
    document: UploadableDocument,
    token: string,
    result: DocumentUploadResult,
    hashes: { pdf: string; docx: string },
): Promise<boolean> {
    const { pdf, docx } = artifactPair(document.artifacts);
    if (!pdf || !docx) return false;
    const finalized = await documentTable(type, tx).updateMany(
        { id: document.id, deletedAt: null, status: DocumentStatus.UPLOADING, uploadToken: token },
        { status: DocumentStatus.UPLOADED, uploadToken: null, error: null },
    );
    if (finalized.count !== 1) return false;

    const updates = artifactUpdates(result, hashes);
    await tx.documentArtifact.update({ where: { id: pdf.id }, data: updates.pdf });
    await tx.documentArtifact.update({ where: { id: docx.id }, data: updates.docx });
    return true;
}

const claimableUpload = (staleBefore: Date) => ({
    OR: [
        { status: DocumentStatus.GENERATED, uploadToken: null },
        { status: DocumentStatus.UPLOADING, updatedAt: { lt: staleBefore } },
    ],
});

export async function uploadGeneratedDocument(
    type: DocumentType,
    documentId: string,
): Promise<DocumentUploadResult> {
    const table = documentTable(type);
    const document = await table.findWithArtifacts(documentId);
    if (!document) throw new AppException("Document not found.", 404, "DOCUMENT_NOT_FOUND");

    const uploading = (token: string) => ({
        id: document.id, deletedAt: null, status: DocumentStatus.UPLOADING, uploadToken: token,
    });

    return uploadDocument({
        document,
        ...table.nextcloud,
        claim: async (token, staleBefore) => (await table.updateMany(
            { id: document.id, deletedAt: null, ...claimableUpload(staleBefore) },
            { status: DocumentStatus.UPLOADING, uploadToken: token, error: null },
        )).count === 1,
        reload: () => table.reloadWithArtifacts(document.id),
        finalize: (claimedDocument, token, result, hashes) => prisma.$transaction((tx) =>
            finalizeUpload(type, tx, claimedDocument, token, result, hashes)),
        release: async (token, error) => {
            await table.updateMany(uploading(token), { status: DocumentStatus.GENERATED, uploadToken: null, error });
        },
        renew: async (token) => {
            await table.updateMany(uploading(token), { updatedAt: new Date() });
        },
    });
}