import { useMemo } from "react";
import { useOffers } from "@/hooks/offers/offer-hooks";
import { useOrders } from "@/hooks/orders/order-hooks";

export type DashboardStats = {
    offers: {
        total: number;
        volume: number;
    },
    orders: {
        total: number;
        volume: number;
    },
};

export function useDashboardStats() {
    const { items: offers } = useOffers();
    const { orders, isPending: ordersPending } = useOrders();

    const stats = useMemo<DashboardStats>(() => {
        const openOffers = offers.filter((offer) => !offer.orders);

        const openOfferVolumeCents = openOffers.reduce(
            (sum, offer) => sum + offer.net_amount,
            0,
        );

        const orderVolumeCents = orders.reduce(
            (sum, order) => sum + order.net_amount,
            0,
        );

        return {
            offers: {
                total: offers.length,
                volume: openOfferVolumeCents,
            },
            orders: {
                total: orders.length,
                volume: orderVolumeCents,
            }
        };
    }, [offers, orders]);

    return { stats, isPending: ordersPending };
}
