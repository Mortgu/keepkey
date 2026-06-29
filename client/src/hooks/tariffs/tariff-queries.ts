import {queryOptions} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    getTariffDurations,
    getTariffGroups,
    getTariffHistory,
} from "./tariff-api";

export const tariffQueries = {
    groups: () => {
        return queryOptions({
            queryKey: tariffKeys.groups(),
            queryFn: getTariffGroups,
        });
    },

    history: (productId: string, contractId: string) => {
        return queryOptions({
            queryKey: tariffKeys.history(productId, contractId),
            queryFn: () => getTariffHistory(productId, contractId),
            enabled: Boolean(productId) && Boolean(contractId),
        });
    },

    durations: (productId: string, contractId: string) => {
        return queryOptions({
            queryKey: tariffKeys.durations(productId, contractId),
            queryFn: () => getTariffDurations(productId, contractId),
            enabled: Boolean(productId) && Boolean(contractId),
        });
    },
};
