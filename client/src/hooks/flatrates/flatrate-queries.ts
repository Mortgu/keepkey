import { queryOptions } from "@tanstack/react-query";
import { getFlatRates } from "./flatrate-api";
import { flatRateKeys } from "./flatrate-keys";

export const flatRateQueries = {
    list: () => queryOptions({
        queryKey: flatRateKeys.list(),
        queryFn: getFlatRates,
    }),
};
