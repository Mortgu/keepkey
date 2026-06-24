import { useQuery } from "@tanstack/react-query";
import { customerQueries } from "./customer-queries";
import type { CustomerFilters } from "@/types";

export function useCustomers(filters: CustomerFilters = {}) {
    const { data: customers = [], isPending, error } = useQuery(customerQueries.list(filters));
    return { customers, isPending, error };
}

export function useCustomer(id: string) {
    const { data: customer, isPending, error } = useQuery(customerQueries.detail(id));
    return { customer, isPending, error };
}