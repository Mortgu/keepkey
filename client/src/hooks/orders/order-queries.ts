import { queryOptions } from "@tanstack/react-query";
import { getOrders } from "./order-api";
import { orderKeys } from "./order-keys";
import type { OrderFilterParams } from "@keepit/schemas";

export const orderQueries = {
    list: (filters: OrderFilterParams = {}) => queryOptions({
        queryKey: orderKeys.list(filters),
        queryFn: () => getOrders(filters),
    }),
};
