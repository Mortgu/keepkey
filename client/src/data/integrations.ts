import { api } from "@/lib/api-client";

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

export const getIntegrationStatusAction = () =>
    api<IntegrationStatusResponse>("/api/integrations/status", { method: "GET" });
