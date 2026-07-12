import { useMemo } from "react";
import { useOffers } from "./offers/offer-hooks";
import { useOrderHook } from "./order-hook";

export type DashboardStats = {
    /** Sum of net_amount (cents) of all open offers (without linked order). */
    openOfferVolumeCents: number;
    /** Count of offers without a linked order. */
    openOfferCount: number;
    /** Total number of orders. */
    orderCount: number;
    /** orders / offers as a ratio in [0, 1]. */
    conversionRate: number;
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

        const conversionRate =
            offers.length > 0 ? orders.length / offers.length : 0;

        return {
            openOfferVolumeCents,
            openOfferCount: openOffers.length,
            orderCount: orders.length,
            conversionRate,
        };
    }, [offers, orders]);

    return { stats, isPending: ordersPending };
};
