import type { ActivitiesPage, ActivityFilterParams } from "@keepit/schemas";
import { api } from "@/lib/api-client";
import { formatQueryString } from "@/lib/utils";

export const getActivities = async (filters: ActivityFilterParams) =>
    api<ActivitiesPage>(`/api/activities?${formatQueryString(filters)}`, {
        method: "GET",
    });
