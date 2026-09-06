import { queryOptions } from "@tanstack/react-query";
import { getDashboardStats } from "./dashboard-api";
import { dashboardKeys } from "./dashboard-keys";

export const dashboardQueries = {
    stats: () =>
        queryOptions({
            queryKey: dashboardKeys.stats(),
            queryFn: getDashboardStats,
        }),
};
