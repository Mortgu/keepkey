import { useQuery } from "@tanstack/react-query";
import { orderQueries } from "./order-queries";
import type { OrderFilterParams } from "@keepit/schemas";

const EMPTY_ARRAY: Array<never> = [];

export function useOrders(filters: OrderFilterParams = {}) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(orderQueries.list(filters));
    return { orders: data, isPending, error };
}

export function useNextOrderNumber() {
    const { data, isPending } = useQuery(orderQueries.nextNumber());
    return { nextOrderNumber: data?.orderId, isPending };
}

export function useOrderRevisions(orderId: string) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(orderQueries.revisions(orderId));
    return { revisions: data, isPending, error };
}
