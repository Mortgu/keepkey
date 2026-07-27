import { queryOptions } from "@tanstack/react-query";
import { getOfferRevisions, getOffers } from "./offer-api";
import { offerKeys } from "./offers-keys";
import type { OfferFilterParams } from "@keepit/schemas";

export const offerQueries = {
    list: (filters: OfferFilterParams = {}) => {
        return queryOptions({
            queryKey: offerKeys.list(filters),
            queryFn: () => getOffers(filters),
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