import { useQuery } from "@tanstack/react-query";
import { flatRateQueries } from "./flatrate-queries";
import type { FlatrateFilterParams } from "@keepit/schemas";

const EMPTY_ARRAY: Array<never> = [];

export function useFlatRates(filters: FlatrateFilterParams = {}) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(flatRateQueries.list(filters));
    return { flatRates: data, isPending, error };
}
