import type { OfferFilters } from "@/types";

export const offerKeys = {
    all: ["offers"] as const,
    lists: () => [...offerKeys.all, "list"] as const,
    list: (filters: OfferFilters = {}) => [...offerKeys.lists(), filters] as const,

    details: () => [...offerKeys.all, 'detail'] as const,
    detail: (id: string) => [...offerKeys.details(), id] as const,

    revisions: (offerId: string) => [...offerKeys.all, 'revisions', offerId] as const,
    tasks: () => [...offerKeys.all, 'tasks'] as const,
    task: (taskId: string) => [...offerKeys.tasks(), taskId] as const,
};