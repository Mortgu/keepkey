import { queryOptions } from "@tanstack/react-query";
import { getNextOrderNumber, getOrderRevisions, getOrders } from "./order-api";
import { orderKeys } from "./order-keys";

export const orderQueries = {
    list: () => queryOptions({
        queryKey: orderKeys.list(),
        queryFn: getOrders,
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
