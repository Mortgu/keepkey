import type { OfferFilters } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { offerQueries } from "./offer-queries";

export function useOffers(filters: OfferFilters = {}) {
    const { data: offers = [], isPending, error } = useQuery(offerQueries.list(filters));

    return { offers, isPending, error }
}