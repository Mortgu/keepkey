import { useQuery } from "@tanstack/react-query";
import type {IntegrationStatusResponse} from "@/data/integrations";
import {  getIntegrationStatusAction } from "@/data/integrations";

export const integrationKeys = {
    all: ["integrations"] as const,
    status: () => [...integrationKeys.all, "status"] as const,
};

export const useIntegrationStatus = () => {
    const query = useQuery<IntegrationStatusResponse>({
        queryKey: integrationKeys.status(),
        queryFn: getIntegrationStatusAction,
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
};
