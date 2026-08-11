import { queryOptions } from "@tanstack/react-query";
import { getNextQuoteId, getOfferRevisions, getOffers, getQuoteIdAvailability } from "./offer-api";
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

    /**
     * Nächste freie Belegnummer. Nichts wird reserviert, der Vorschlag kann also
     * jederzeit veralten — deshalb `staleTime: 0`, damit ein erneut geöffnetes Modal
     * keine inzwischen vergebene Nummer aus dem Cache zeigt.
     */
    nextQuoteId: () => {
        return queryOptions({
            queryKey: offerKeys.nextQuoteId(),
            queryFn: () => getNextQuoteId(),
            staleTime: 0,
            gcTime: 0,
        });
    },

    quoteIdAvailability: (quoteId: string) => {
        return queryOptions({
            queryKey: offerKeys.quoteIdAvailability(quoteId),
            queryFn: () => getQuoteIdAvailability(quoteId),
            enabled: Boolean(quoteId),
            staleTime: 0,
        });
    },
};