import type { CustomerFilters } from "@/types";
import { offerKeys } from "../offers/offers-keys";

export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,

    details: () => [...offerKeys.all, "detail"] as const,
    detail: (id: string) => [...offerKeys.details(), id] as const,
}