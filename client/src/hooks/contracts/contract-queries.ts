import { queryOptions } from "@tanstack/react-query";
import { contractKeys } from "./contract-keys";
import { getContracts } from "./contract-api";

export const contractQueries = {
    lists: () => {
        return queryOptions({
            queryKey: contractKeys.lists(),
            queryFn: () => getContracts(),
            staleTime: 30_000,
        });
    },
}