import { useQuery } from "@tanstack/react-query";
import { supplierQueries } from "./supplier-queries";

const EMPTY_ARRAY: never[] = [];

export function useSuppliers() {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(supplierQueries.list());
    return { suppliers: data, isPending, error };
}
