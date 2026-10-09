import {queryOptions} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    getStandardDurations,
    getStandardTiers,
    getTariffGroups,
} from "./tariff-api";

export const tariffQueries = {
    groups: () => {
        return queryOptions({
            queryKey: tariffKeys.groups(),
            queryFn: getTariffGroups,
        });
    },

    standardDurations: () => {
        return queryOptions({
            queryKey: tariffKeys.standardDurations(),
            queryFn: getStandardDurations,
        });
    },

    standardTiers: () => {
        return queryOptions({
            queryKey: tariffKeys.standardTiers(),
            queryFn: getStandardTiers,
        });
    },
};
