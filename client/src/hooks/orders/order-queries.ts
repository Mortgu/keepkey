import { queryOptions } from "@tanstack/react-query";
import { getNextOrderNumber, getOrderRevisions, getOrders } from "./order-api";
import { orderKeys } from "./order-keys";
import type { OrderFilterParams } from "@keepit/schemas";

export const orderQueries = {
    list: (filters: OrderFilterParams = {}) => queryOptions({
        queryKey: orderKeys.list(filters),
        queryFn: () => getOrders(filters),
    }),
    nextNumber: () => queryOptions({
        queryKey: orderKeys.nextNumber(),
        queryFn: getNextOrderNumber,
    }),
    revisions: (orderId: string) => queryOptions({
        queryKey: orderKeys.revisions(orderId),
        queryFn: () => getOrderRevisions(orderId),
        enabled: Boolean(orderId),
    }),
};
