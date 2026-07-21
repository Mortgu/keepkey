import { useQuery } from "@tanstack/react-query";
import { flatRateQueries } from "./flatrate-queries";

const EMPTY_ARRAY: never[] = [];

export function useFlatRates() {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(flatRateQueries.list());
    return { flatRates: data, isPending, error };
}
