import { queryOptions } from "@tanstack/react-query";
import { getActivities } from "./activity-api";
import { activityKeys } from "./activities-keys";
import type { ActivityFilterParams } from "@keepit/schemas";

export const activityQueries = {
    list: (filters: ActivityFilterParams = {}) => {
        return queryOptions({
            queryKey: activityKeys.list(filters),
            queryFn: () => getActivities(filters),
        });
    },
};
