import env from "../lib/env.js";
import connection from "../lib/redis.js";
import { getCloudStatus } from "./nextcloud.service.js";
import { isS3Available } from "../lib/document-artifact-store.js";

export type IntegrationStatus = "connected" | "failed" | "not_configured";

export type IntegrationEntry = {
    status: IntegrationStatus;
    detail?: string;
    meta?: Record<string, string>;
};

export type IntegrationStatusResponse = {
    nextcloud: IntegrationEntry;
    redis: IntegrationEntry;
    s3: IntegrationEntry;
};

function mapStatus(configured: boolean, available: boolean): IntegrationStatus {
    if (!configured) return "not_configured";
    return available ? "connected" : "failed";
}

/** Strip credentials from a connection URL (e.g. redis://:secret@host:6379 -> redis://host:6379). */
function sanitizeUrl(raw: string): string {
    try {
        const parsed = new URL(raw);
        parsed.username = "";
        parsed.password = "";
        return parsed.toString();
    } catch {
        return raw;
    }
}

async function nextcloudStatus(): Promise<IntegrationEntry> {
    const cloud = getCloudStatus();
    const status = mapStatus(cloud.configured, cloud.available);
    const meta: Record<string, string> = {};
    if (env.NEXTCLOUD_URL) meta.url = sanitizeUrl(env.NEXTCLOUD_URL);
    return { status, detail: status === "connected" ? undefined : cloud.message, meta };
}

async function redisStatus(): Promise<IntegrationEntry> {
    const meta: Record<string, string> = {};
    if (env.REDIS_URL) meta.url = sanitizeUrl(env.REDIS_URL);

    try {
        const reply = await connection.ping();
        return { status: reply === "PONG" ? "connected" : "failed", meta };
    } catch (error) {
        return {
            status: "failed",
            detail: error instanceof Error ? error.message : String(error),
            meta,
        };
    }
}

async function s3Status(): Promise<IntegrationEntry> {
    const meta: Record<string, string> = {
        endpoint: sanitizeUrl(env.S3_ENDPOINT),
        bucket: env.S3_BUCKET,
    };

    const available = await isS3Available();
    return { status: available ? "connected" : "failed", meta };
}

export async function getIntegrationStatus(): Promise<IntegrationStatusResponse> {
    const [nextcloud, redis, s3] = await Promise.all([nextcloudStatus(), redisStatus(), s3Status()]);
    return { nextcloud, redis, s3 };
}
