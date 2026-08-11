import { queryOptions } from "@tanstack/react-query";
import { isLivePriceable } from "@keepit/schemas";
import { getLivePrice, getPinnedPrice } from "./pricing-api";
import { pricingKeys } from "./pricing-keys";
import type { LivePriceQuery } from "@keepit/schemas";

export const pricingQueries = {
    /**
     * Preis aus dem aktuell gültigen Tarif.
     *
     * `staleTime: 0`, weil ein kundenspezifischer Preis jederzeit daneben
     * geschrieben werden kann und die Vorschau das sofort zeigen soll.
     */
    live: (query: LivePriceQuery, enabled = true) =>
        queryOptions({
            queryKey: pricingKeys.live(query),
            queryFn: () => getLivePrice(query),
            enabled: enabled && isLivePriceable(query),
            staleTime: 0,
        }),

    /** Preis aus der von der Quellposition angepinnten Tarif-Version. */
    pinned: (customerId: string, positionId: string, duration: number, quantity: number, free_months: number, enabled = true) =>
        queryOptions({
            queryKey: pricingKeys.pinned(customerId, positionId, duration, quantity, free_months),
            queryFn: () => getPinnedPrice(customerId, positionId, duration, quantity, free_months),
            enabled: enabled
                && Boolean(customerId) && Boolean(duration) && Boolean(positionId)
                && Number.isInteger(quantity) && quantity > 0,
        }),
};
