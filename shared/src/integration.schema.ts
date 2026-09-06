import { z } from "zod";

export const integrationStatusSchema = z.enum([
    "connected", "failed", "not_configured",
]);
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;

export const integrationEntrySchema = z.object({
    status: integrationStatusSchema,
    detail: z.string().optional(),
    meta: z.record(z.string(), z.string()).optional(),
});
export type IntegrationEntry = z.infer<typeof integrationEntrySchema>;

export const integrationStatusResponseSchema = z.object({
    nextcloud: integrationEntrySchema,
    redis: integrationEntrySchema,
    s3: integrationEntrySchema,
});
export type IntegrationStatusResponse = z.infer<typeof integrationStatusResponseSchema>;