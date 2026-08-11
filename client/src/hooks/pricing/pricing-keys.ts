import type { LivePriceQuery, PinnedPriceQuery } from "@keepit/schemas";

export const pricingKeys = {
    all: ["pricing"] as const,

    lives: () => [...pricingKeys.all, "live"] as const,
    live: (query: LivePriceQuery) => [...pricingKeys.lives(), query] as const,

    pinneds: () => [...pricingKeys.all, "pinned"] as const,
    pinned: (query: PinnedPriceQuery) =>
        [...pricingKeys.pinneds(), query] as const,
};
