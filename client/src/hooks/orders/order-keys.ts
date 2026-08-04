import type { OrderFilterParams } from "@keepit/schemas";

export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (filters: OrderFilterParams = {}) => [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
    revisions: (id: string) => [...orderKeys.all, id, "revisions"] as const,
    nextNumber: () => [...orderKeys.all, "next-number"] as const,
};
