import { queryOptions } from "@tanstack/react-query";
import { getOffers } from "./offer-api";
import { offerKeys } from "./offers-keys";
import type { OfferFilterParams } from "@keepit/schemas";

export const offerQueries = {
    list: (filters: OfferFilterParams = {}) => {
        return queryOptions({
            queryKey: offerKeys.list(filters),
            queryFn: () => getOffers(filters),
        });
    },
};