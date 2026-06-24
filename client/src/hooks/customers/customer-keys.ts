import type { CustomerFilters } from "@/types";

export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (filters: CustomerFilters = {}) => [...customerKeys.lists(), filters] as const,

    details: () => [...customerKeys.all, 'detail'] as const,
    detail: (id: string) => [...customerKeys.details(), id] as const,

    contacts: () => [...customerKeys.all, "contacts"] as const,
};
