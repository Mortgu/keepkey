import type { ActivityFilterParams } from "@keepit/schemas";

export const activityKeys = {
    all: ["activities"] as const,
    lists: () => [...activityKeys.all, "list"] as const,
    list: (filters: ActivityFilterParams = {}) => [...activityKeys.lists(), filters] as const,
};
