import type { UserFilterParams } from "@keepit/schemas";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters: UserFilterParams = {}) => [...userKeys.lists(), filters] as const,
    session: () => [...userKeys.all, "session"] as const,
};
