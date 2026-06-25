import { queryOptions } from "@tanstack/react-query";
import { getContacts, getCustomer, getCustomers } from "./customer-api";
import { customerKeys } from "./customer-keys";
import type { CustomerFilters } from "@/types";

export const customerQueries = {
    list: (filters: CustomerFilters = {}) => {
        return queryOptions({
            queryKey: customerKeys.list(filters),
            queryFn: () => getCustomers(),
            staleTime: 30_000,
        });
    },

    detail: (id: string) => {
        return queryOptions({
            queryKey: customerKeys.detail(id),
            queryFn: () => getCustomer(id),
            enabled: Boolean(id)
        });
    },

    contacts: () => {
        return queryOptions({
            queryKey: customerKeys.contacts(),
            queryFn: () => getContacts(),
            staleTime: 30_000,
        });
    },
}
