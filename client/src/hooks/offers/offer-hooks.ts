import { useQuery } from "@tanstack/react-query";
import { offerQueries } from "./offer-queries";

import type {
    OfferFilterParams,
    OffersPage
} from "@keepit/schemas";

const EMPTY_PAGE: OffersPage = { items: [], nextCursor: null };

export function useOffers(filters: OfferFilterParams = {}) {
    const { data = EMPTY_PAGE, isPending, error } = useQuery(offerQueries.list(filters));

    return { items: data.items, nextCursor: data.nextCursor, isPending, error }
}

/**
 * Preis einer Erweiterungsposition bei geänderter Menge — aufgelöst über die
 * eingefrorene Tarif-Version der Quellposition statt über den Live-Tarif.
 */
export function useExtensionPrice(offerId: string, positionId: string, quantity: number) {
    const { data, isPending, error } = useQuery(offerQueries.extensionPrice(offerId, positionId, quantity));

    return { price: data, isPending, error };
}