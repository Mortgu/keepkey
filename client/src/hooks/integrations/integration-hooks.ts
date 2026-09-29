import { useQuery } from "@tanstack/react-query";
import { integrationQueries } from "./integration-queries";

export function useIntegrationStatus() {
    const query = useQuery(integrationQueries.status());

    return {
        data: query.data,
        isPending: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}
