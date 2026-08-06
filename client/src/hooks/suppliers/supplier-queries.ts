import { queryOptions } from "@tanstack/react-query";
import { getSuppliers } from "./supplier-api";
import { supplierKeys } from "./supplier-keys";
import type { SupplierFilterParams } from "@keepit/schemas";

export const supplierQueries = {
    list: (filters: SupplierFilterParams = {}) => queryOptions({
        queryKey: supplierKeys.list(filters),
        queryFn: () => getSuppliers(filters),
    }),
};
