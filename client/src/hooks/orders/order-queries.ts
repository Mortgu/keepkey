import type { OrderFilterParams } from "@keepit/schemas";
import { queryOptions } from "@tanstack/react-query";
import { getNextOrderNumber, getOrders } from "./order-api";
import { orderKeys } from "./order-keys";

export const orderQueries = {
    list: (filters: OrderFilterParams = {}) => queryOptions({
        queryKey: orderKeys.list(filters),
        queryFn: () => getOrders(filters),
    }),
    nextNumber: () => queryOptions({
        queryKey: orderKeys.nextNumber(),
        queryFn: getNextOrderNumber,
    }),
};
