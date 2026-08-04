import { queryOptions } from "@tanstack/react-query";
import { getProduct, getProducts } from "./product-api";
import { productKeys } from "./product-keys";
import type { WorkloadFilterParams } from "@keepit/schemas";

export const productQueries = {
    list: (filters: WorkloadFilterParams = {}) => queryOptions({
        queryKey: productKeys.list(filters),
        queryFn: () => getProducts(filters),
    }),

    detail: (id: string) => queryOptions({
        queryKey: productKeys.detail(id),
        queryFn: () => getProduct(id),
        enabled: Boolean(id),
    }),
};
