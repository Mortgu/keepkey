import type { CustomerFilters } from "@/types";
import { customerQueries } from "./customer-queries";
import { useQuery } from "@tanstack/react-query";

export function useCustomers(filters: CustomerFilters = {}) {
    const { data: customers = [], isPending, error } = useQuery(customerQueries.list(filters));
    return { customers, isPending, error };
}

export function useCustomer(id: string) {
    const { data: customer, isPending, error } = useQuery(customerQueries.detail(id));
    return { customer, isPending, error };
}