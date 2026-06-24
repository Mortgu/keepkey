import type { CustomerFilters } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import { customerKeys } from "./customer-keys";

export const customerQueries = {
    list: (filters: CustomerFilters = {}) => {
        return queryOptions({
            queryKey: customerKeys.list(filters),
            queryFn: () => { },
            staleTime: 30_000,
        });
    },

    detail: (id: string) => {
        return queryOptions({
            queryKey: customerKeys.detail(id),
            queryFn: () => { },
            enabled: Boolean(id)
        });
    },
}