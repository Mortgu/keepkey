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

export function useOffer(id: string) {
    const { data: offer, isPending, error } = useQuery(offerQueries.detail(id));
    return { offer, isPending, error };
}