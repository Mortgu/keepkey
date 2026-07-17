import { createHash, randomUUID } from "crypto";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./env.js";

export type StoredDocumentArtifact = {
    objectKey: string;
    size: number;
    sha256: string;
};

export type StoredDocumentArtifacts = {
    pdf: StoredDocumentArtifact;
    docx: StoredDocumentArtifact;
};

export type DocumentArtifactScope = "offers" | "orders";
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

const credentials = {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
};

function createClient(endpoint: string): S3Client {
    return new S3Client({
        endpoint,
        region: env.S3_REGION,
        forcePathStyle: env.S3_FORCE_PATH_STYLE,
        credentials,
    });
}

const storageClient = createClient(env.S3_ENDPOINT);
const downloadClient = env.S3_PUBLIC_ENDPOINT && env.S3_PUBLIC_ENDPOINT !== env.S3_ENDPOINT
    ? createClient(env.S3_PUBLIC_ENDPOINT)
    : storageClient;

async function settleOperations(operations: Promise<unknown>[]): Promise<void> {
    const results = await Promise.allSettled(operations);
    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason);

    if (errors.length > 0) {
        throw new AggregateError(errors, "One or more document artifact operations failed.");
    }
}

export async function storeDocumentArtifacts(
    scope: DocumentArtifactScope,
    documentId: string,
    docxBuffer: Buffer,
    pdfBuffer: Buffer,
    generationId: string = randomUUID(),
): Promise<StoredDocumentArtifacts> {
    const prefix = `generated/${scope}/${documentId}/${generationId}`;
    const docx = artifact(`${prefix}.docx`, docxBuffer);
    const pdf = artifact(`${prefix}.pdf`, pdfBuffer);

    try {
        await settleOperations([
            putArtifact(docx, docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            putArtifact(pdf, pdfBuffer, "application/pdf"),
        ]);
    } catch (error) {
        try {
            await removeDocumentArtifacts({ docx, pdf });
        } catch (cleanupError) {
            throw new AggregateError(
                [error, cleanupError],
                "Publishing document artifacts failed and cleanup was incomplete.",
            );
        }
        throw error;
    }

    return { pdf, docx };
}

export async function removeDocumentArtifacts(files: StoredDocumentArtifacts): Promise<void> {
    await settleOperations([
        deleteArtifact(files.docx.objectKey),
        deleteArtifact(files.pdf.objectKey),
    ]);
}

export async function getDocumentArtifact(objectKey: string): Promise<Buffer> {
    const response = await storageClient.send(new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
    }));

    if (!response.Body) {
        throw new Error(`Object ${objectKey} has no body.`);
    }

    return Buffer.from(await response.Body.transformToByteArray());
}

export async function getDocumentDownloadUrl(objectKey: string, downloadName: string, contentType: string): Promise<string> {
    const safeName = downloadName.replace(/["\\\r\n]/g, "_");

    return getSignedUrl(downloadClient, new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
        ResponseContentType: contentType,
        ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }), { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
}

export async function isS3Available(): Promise<boolean> {
    try {
        await storageClient.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
        return true;
    } catch {
        return false;
    }
}

export async function initDocumentArtifactStore(): Promise<void> {
    await storageClient.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
}

function artifact(objectKey: string, content: Buffer): StoredDocumentArtifact {
    return {
        objectKey,
        size: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
    };
}

async function putArtifact(
    stored: StoredDocumentArtifact,
    content: Buffer,
    contentType: string,
): Promise<void> {
    await storageClient.send(new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: stored.objectKey,
        Body: content,
        ContentLength: stored.size,
        ContentType: contentType,
        Metadata: { sha256: stored.sha256 },
    }));
}

async function deleteArtifact(objectKey: string): Promise<void> {
    await storageClient.send(new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
    }));
}
