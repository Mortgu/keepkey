import type { OfferFilters } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import { getOfferRevisions, getOffers } from "./offer-api";
import { offerKeys } from "./offers-keys";

export const offerQueries = {
    list: (filters: OfferFilters = {}) => {
        return queryOptions({
            queryKey: offerKeys.list(filters),
            queryFn: () => getOffers(filters),
            staleTime: 30_000,
        });
    },

    revisions: (offerId: string) => {
        return queryOptions({
            queryKey: offerKeys.revisions(offerId),
            queryFn: () => getOfferRevisions(offerId),
            enabled: Boolean(offerId),
        });
    },
};