import { queryOptions } from "@tanstack/react-query";
import { getSuppliers } from "./supplier-api";
import { supplierKeys } from "./supplier-keys";

export const supplierQueries = {
    list: () => queryOptions({
        queryKey: supplierKeys.list(),
        queryFn: getSuppliers,
    }),
};
