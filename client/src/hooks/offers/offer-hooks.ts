import { useQuery } from "@tanstack/react-query";
import { offerQueries } from "./offer-queries";

import type {
    OfferFilterParams,
    OffersPage
} from "@keepit/schemas";

const EMPTY_PAGE: OffersPage = { items: [], nextCursor: null };

const EMPTY_REVISIONS: Array<never> = [];

export function useOffers(filters: OfferFilterParams = {}) {
    const { data = EMPTY_PAGE, isPending, error } = useQuery(offerQueries.list(filters));

    return { items: data.items, nextCursor: data.nextCursor, isPending, error }
}

export function useOfferRevisions(offerId: string, options?: { enabled?: boolean }) {
    const { data = EMPTY_REVISIONS, isPending, error } = useQuery({
        ...offerQueries.revisions(offerId),
        enabled: options?.enabled,
    });

    return { revisions: data, isPending, error };
}