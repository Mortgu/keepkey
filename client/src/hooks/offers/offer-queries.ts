import { queryOptions } from "@tanstack/react-query";
import { getExtensionPrice, getOfferRevisions, getOffers } from "./offer-api";
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

    extensionPrice: (offerId: string, positionId: string, quantity: number) => {
        return queryOptions({
            queryKey: offerKeys.extensionPrice(offerId, positionId, quantity),
            queryFn: () => getExtensionPrice(offerId, positionId, quantity),
            enabled: Boolean(offerId) && Boolean(positionId)
                && Number.isInteger(quantity) && quantity > 0,
        });
    },
};