import {queryOptions} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    getStandardDurations,
    getTariffDurations,
    getTariffGroups,
    getTariffVersions,
} from "./tariff-api";

export const tariffQueries = {
    groups: () => {
        return queryOptions({
            queryKey: tariffKeys.groups(),
            queryFn: getTariffGroups,
        });
    },

    versions: (groupId: string, tariffId: string) => {
        return queryOptions({
            queryKey: tariffKeys.versions(tariffId),
            queryFn: () => getTariffVersions(groupId, tariffId),
            enabled: Boolean(groupId) && Boolean(tariffId),
        });
    },

    standardDurations: () => {
        return queryOptions({
            queryKey: tariffKeys.standardDurations(),
            queryFn: getStandardDurations,
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
