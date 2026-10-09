import type { OfferFilterParams } from "@keepit/schemas";
import { queryOptions } from "@tanstack/react-query";
import { getOffer, getOffers } from "./offer-api";
import { offerKeys } from "./offers-keys";

export const offerQueries = {
    list: (filters: OfferFilterParams = {}) => {
        return queryOptions({
            queryKey: offerKeys.list(filters),
            queryFn: () => getOffers(filters),
        });
    },

    detail: (id: string) => {
        return queryOptions({
            queryKey: offerKeys.detail(id),
            queryFn: () => getOffer(id),
            enabled: Boolean(id),
        });
    },
};