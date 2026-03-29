import type { Order } from "@/data/types";

export function calculateOrdersTotalPrice(orders: Order[]): number {
    return orders.reduce((total, order) => {
        const orderTotal = order.orderPositions?.reduce(
            (sum, position) => sum + position.priceAtPurchase,
            0
        ) ?? 0;
        return total + orderTotal;
    }, 0);
}
