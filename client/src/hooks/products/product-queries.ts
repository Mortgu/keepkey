import { queryOptions } from "@tanstack/react-query";
import { getProduct, getProducts } from "./product-api";
import { productKeys } from "./product-keys";

export const productQueries = {
    list: () => queryOptions({
        queryKey: productKeys.list(),
        queryFn: getProducts,
    }),
    detail: (id: string) => queryOptions({
        queryKey: productKeys.detail(id),
        queryFn: () => getProduct(id),
        enabled: Boolean(id),
    }),
};
