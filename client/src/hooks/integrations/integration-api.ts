import { api } from "@/lib/api-client";

import type { IntegrationStatusResponse } from "@keepit/schemas";

export const getIntegrationStatus = () =>
    api<IntegrationStatusResponse>("/api/integrations/status", { method: "GET" });
