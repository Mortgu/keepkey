import { useQuery } from "@tanstack/react-query";
import { supplierQueries } from "./supplier-queries";
import type { SupplierFilterParams } from "@keepit/schemas";

const EMPTY_ARRAY: Array<never> = [];

export function useSuppliers(filters: SupplierFilterParams = {}) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(supplierQueries.list(filters));
    return { suppliers: data, isPending, error };
}
