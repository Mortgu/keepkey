import type { IntegrationStatusResponse } from "@keepit/schemas";
import { api } from "@/lib/api-client";


export const getIntegrationStatus = () =>
    api<IntegrationStatusResponse>("/api/integrations/status", { method: "GET" });
