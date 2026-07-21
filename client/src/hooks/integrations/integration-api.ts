import type { IntegrationStatusResponse } from "@/data/integrations";
import { api } from "@/lib/api-client";

export const getIntegrationStatus = () =>
    api<IntegrationStatusResponse>("/api/integrations/status", { method: "GET" });
