import type { PriceCoordinates } from "@keepit/schemas";

export const pricingKeys = {
    all: ["pricing"] as const,

    lives: () => [...pricingKeys.all, "live"] as const,
    live: (coordinates: PriceCoordinates) => [...pricingKeys.lives(), coordinates] as const,

    pinneds: () => [...pricingKeys.all, "pinned"] as const,
    pinned: (offerId: string, positionId: string, quantity: number) =>
        [...pricingKeys.pinneds(), offerId, positionId, quantity] as const,
};
