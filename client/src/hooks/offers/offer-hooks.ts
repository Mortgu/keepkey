import type { OfferFilters, OffersPage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { offerQueries } from "./offer-queries";

const EMPTY_PAGE: OffersPage = { items: [], nextCursor: null };

export function useOffers(filters: OfferFilters = {}) {
    const { data = EMPTY_PAGE, isPending, error } = useQuery(offerQueries.list(filters));

    return { items: data.items, nextCursor: data.nextCursor, isPending, error }
}