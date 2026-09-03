import type { FlatrateFilterParams } from "@keepit/schemas";

export const flatRateKeys = {
    all: ["flatrates"] as const,
    lists: () => [...flatRateKeys.all, "list"] as const,
    list: (filters: FlatrateFilterParams = {}) => [...flatRateKeys.lists(), filters] as const,
    details: () => [...flatRateKeys.all, "detail"] as const,
    detail: (id: string) => [...flatRateKeys.details(), id] as const,
};
