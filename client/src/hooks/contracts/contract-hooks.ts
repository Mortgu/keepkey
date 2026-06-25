import { useQuery } from "@tanstack/react-query";
import { contractQueries } from "./contract-queries";

export function useContracts() {
    const { data: contracts = [], ...rest } = useQuery(contractQueries.lists());

    return {
        contracts,
        ...rest
    }
}