import { queryOptions } from "@tanstack/react-query";
import { getFlatRates, getFlatrate } from "./flatrate-api";
import { flatRateKeys } from "./flatrate-keys";

export const flatRateQueries = {
    list: () => queryOptions({
        queryKey: flatRateKeys.list(),
        queryFn: getFlatRates,
    }),

    detail: (id: string) => queryOptions({
        queryKey: flatRateKeys.detail(id),
        queryFn: () => getFlatrate(id),
        enabled: Boolean(id),
    })
};
