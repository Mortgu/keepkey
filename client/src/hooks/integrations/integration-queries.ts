import { queryOptions } from "@tanstack/react-query";
import { getIntegrationStatus } from "./integration-api";
import { integrationKeys } from "./integration-keys";

export const integrationQueries = {
    status: () => queryOptions({
        queryKey: integrationKeys.status(),
        queryFn: () => getIntegrationStatus(),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    }),
};
