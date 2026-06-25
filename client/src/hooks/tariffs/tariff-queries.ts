import {queryOptions} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    getAllTariffsAction,
    getProductTariffsAction,
    getTariffDurationsAction,
    getTariffHistoryAction,
} from "@/data/tariffs";

export const tariffQueries = {
    list: (productId?: string) => {
        return queryOptions({
            queryKey: tariffKeys.list(productId),
            queryFn: productId ? () => getProductTariffsAction(productId) : getAllTariffsAction,
        });
    },

    history: (productId: string, contractId: string) => {
        return queryOptions({
            queryKey: tariffKeys.history(productId, contractId),
            queryFn: () => getTariffHistoryAction(productId, contractId),
            enabled: Boolean(productId) && Boolean(contractId),
        });
    },

    durations: (productId: string, contractId: string) => {
        return queryOptions({
            queryKey: tariffKeys.durations(productId, contractId),
            queryFn: () => getTariffDurationsAction(productId, contractId),
            enabled: Boolean(productId) && Boolean(contractId),
        });
    },
};
