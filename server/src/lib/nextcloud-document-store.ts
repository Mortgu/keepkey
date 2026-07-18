import { createHash } from "crypto";
import type { FileStat } from "webdav";
import { getNextCloudClient } from "./nextcloud.js";
import logger from "../middlewares/logger.js";

export type RemoteDocumentArtifact = {
    remotePath: string;
    remoteEtag: string | null;
    uploadedAt: Date;
    size: number;
    sha256: string;
};

export class RemoteDocumentConflictError extends Error {
    constructor(
        public readonly remotePath: string,
        public readonly expectedSha256: string,
        public readonly actualSha256: string | null,
    ) {
        super(`Remote document ${remotePath} already exists with different content.`);
        this.name = "RemoteDocumentConflictError";
    }
}

export function sha256Document(content: Buffer): string {
    return createHash("sha256").update(content).digest("hex");
}

function remotePath(directory: string, filename: string): string {
    return `${directory.replace(/\/$/, "")}/${filename}`;
}

function toBuffer(content: Buffer | ArrayBuffer | string): Buffer {
    if (Buffer.isBuffer(content)) return content;
    if (typeof content === "string") return Buffer.from(content);
    return Buffer.from(content);
}

async function getRemoteFile(path: string): Promise<{ stat: FileStat; sha256: string } | null> {
    const client = getNextCloudClient();
    if (!await client.exists(path)) return null;

    const stat = await client.stat(path);
    if (!("size" in stat)) {
        throw new Error(`Nextcloud returned an invalid stat response for ${path}.`);
    }
    const content = await client.getFileContents(path, { format: "binary" });

    if (typeof content === "object" && content !== null && "data" in content) {
        throw new Error(`Nextcloud returned an unexpected detailed response for ${path}.`);
    }

    return { stat, sha256: sha256Document(toBuffer(content)) };
}

function asResult(path: string, stat: FileStat, sha256: string): RemoteDocumentArtifact {
    const uploadedAt = new Date(stat.lastmod);
    return {
        remotePath: path,
        remoteEtag: stat.etag,
        uploadedAt: Number.isNaN(uploadedAt.getTime()) ? new Date() : uploadedAt,
        size: stat.size,
        sha256,
    };
}

export async function uploadDocumentArtifact(filename: string, directory: string, content: Buffer, expectedSha256: string): Promise<RemoteDocumentArtifact> {
    const localSha256 = sha256Document(content);

    if (localSha256 !== expectedSha256) {
        throw new Error(`Local document ${filename} does not match its stored SHA-256 checksum.`);
    }

    const path = remotePath(directory, filename);

    const existing = await getRemoteFile(path);

    if (existing) {
        if (existing.stat.size !== content.length || existing.sha256 !== expectedSha256) {
            throw new RemoteDocumentConflictError(path, expectedSha256, existing.sha256);
        }

        return asResult(path, existing.stat, existing.sha256);
    }

    const client = getNextCloudClient();

    try {
        const created = await client.putFileContents(path, content, {
            overwrite: false,
            headers: {
                "OC-Checksum": `SHA256:${expectedSha256}`,
                "X-Hash": "sha256",
            },
        });

        logger.debug('nextcloud_upload_result', { created, path });

        if (!created) {
            const raced = await getRemoteFile(path);
            if (!raced) throw new Error(`Nextcloud rejected the upload for ${path}.`);
            if (raced.stat.size !== content.length || raced.sha256 !== expectedSha256) {
                throw new RemoteDocumentConflictError(path, expectedSha256, raced.sha256);
            }
            return asResult(path, raced.stat, raced.sha256);
        }
    } catch (uploadError) {
        logger.warn('nextcloud_upload_error', { error: (uploadError as Error).message, path });

        const raced = await getRemoteFile(path);
        if (!raced) throw uploadError;
        if (raced.stat.size !== content.length || raced.sha256 !== expectedSha256) {
            throw new RemoteDocumentConflictError(path, expectedSha256, raced.sha256);
        }
        return asResult(path, raced.stat, raced.sha256);
    }

    const uploaded = await getRemoteFile(path);
    if (!uploaded || uploaded.stat.size !== content.length || uploaded.sha256 !== expectedSha256) {
        throw new Error(`Nextcloud upload verification failed for ${path}.`);
    }

    return asResult(path, uploaded.stat, uploaded.sha256);
}