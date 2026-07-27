
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