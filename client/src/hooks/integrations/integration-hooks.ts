import { useQuery } from "@tanstack/react-query";
import { getIntegrationStatus } from "./integration-api";
import { integrationKeys } from "./integration-keys";
import type { IntegrationStatusResponse } from "@keepit/schemas";

export function useIntegrationStatus() {
    const query = useQuery<IntegrationStatusResponse>({
        queryKey: integrationKeys.status(),
        queryFn: getIntegrationStatus,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data,
        isPending: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}
