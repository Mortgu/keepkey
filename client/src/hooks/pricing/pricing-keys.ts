import type { LivePriceQuery } from "@keepit/schemas";

export const pricingKeys = {
    all: ["pricing"] as const,

    lives: () => [...pricingKeys.all, "live"] as const,
    live: (query: LivePriceQuery) => [...pricingKeys.lives(), query] as const,

    pinneds: () => [...pricingKeys.all, "pinned"] as const,
    pinned: (customerId: string, positionId: string, duration: number, quantity: number, free_months: number) =>
        [...pricingKeys.pinneds(), customerId, positionId, duration, quantity, free_months] as const,
};
