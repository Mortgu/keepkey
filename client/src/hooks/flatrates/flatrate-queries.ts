import { queryOptions } from "@tanstack/react-query";
import { getFlatRates, getFlatrate } from "./flatrate-api";
import { flatRateKeys } from "./flatrate-keys";
import type { FlatrateFilterParams } from "@keepit/schemas";

export const flatRateQueries = {
    list: (filters: FlatrateFilterParams = {}) => queryOptions({
        queryKey: flatRateKeys.list(filters),
        queryFn: () => getFlatRates(filters),
    }),

    detail: (id: string) => queryOptions({
        queryKey: flatRateKeys.detail(id),
        queryFn: () => getFlatrate(id),
        enabled: Boolean(id),
    })
};
