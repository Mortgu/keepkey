import { useMemo } from "react";
import { useOffers } from "./offers/offer-hooks";
import { useOrderHook } from "./order-hook";

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

export const useDashboardStats = () => {
    const { items: offers } = useOffers();
    const { orders, isPending: ordersPending } = useOrderHook();

    const stats = useMemo<DashboardStats>(() => {
        const openOffers = offers.filter((offer) => !offer.orders);

        const openOfferVolumeCents = openOffers.reduce(
            (sum, offer) => sum + offer.net_amount,
            0,
        );

        const orderVolumeCents = orders.reduce(
            (sum, order) => sum + order.net_amount,
            0,
        )

        const conversionRate =
            offers.length > 0 ? orders.length / offers.length : 0;

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
};
