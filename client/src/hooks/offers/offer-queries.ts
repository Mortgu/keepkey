import { queryOptions } from "@tanstack/react-query";
import { getOfferRevisions, getOffers } from "./offer-api";
import { offerKeys } from "./offers-keys";
import type { OfferFilterInput } from "@keepit/schemas";

export const offerQueries = {
    list: (filters: OfferFilterInput = { limit: 50 }) => {
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