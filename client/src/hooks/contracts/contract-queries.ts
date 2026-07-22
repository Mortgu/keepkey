import { queryOptions } from "@tanstack/react-query";
import { contractKeys } from "./contract-keys";
import { getContract, getContracts } from "./contract-api";

export const contractQueries = {
    lists: () => {
        return queryOptions({
            queryKey: contractKeys.lists(),
            queryFn: () => getContracts(),
            staleTime: 30_000,
        });
    },
    detail: (id: string) => queryOptions({
        queryKey: contractKeys.detail(id),
        queryFn: () => getContract(id),
        enabled: Boolean(id),
    })
}