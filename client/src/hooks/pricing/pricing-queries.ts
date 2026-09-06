import { queryOptions } from "@tanstack/react-query";
import {  isPriceable } from "@keepit/schemas";
import { getCustomerPrices, getLivePrice, getPinnedPrice } from "./pricing-api";
import { pricingKeys } from "./pricing-keys";
import type {PriceCoordinates} from "@keepit/schemas";

export const pricingQueries = {
    /**
     * Preis aus dem aktuell gültigen Tarif.
     *
     * `staleTime: 0`, weil ein kundenspezifischer Preis jederzeit daneben
     * geschrieben werden kann und die Vorschau das sofort zeigen soll.
     */
    live: (coordinates: PriceCoordinates, enabled = true) =>
        queryOptions({
            queryKey: pricingKeys.live(coordinates),
            queryFn: () => getLivePrice(coordinates),
            enabled: enabled && isPriceable(coordinates),
            staleTime: 0,
        }),

    /** Alle für einen Kunden hinterlegten Preise. */
    customerPrices: (customerId: string) =>
        queryOptions({
            queryKey: pricingKeys.customerPrices(customerId),
            queryFn: () => getCustomerPrices(customerId),
            enabled: Boolean(customerId),
        }),

    /** Preis aus der von der Quellposition angepinnten Tarif-Version. */
    pinned: (offerId: string, positionId: string, quantity: number, enabled = true) =>
        queryOptions({
            queryKey: pricingKeys.pinned(offerId, positionId, quantity),
            queryFn: () => getPinnedPrice(offerId, positionId, quantity),
            enabled: enabled
                && Boolean(offerId) && Boolean(positionId)
                && Number.isInteger(quantity) && quantity > 0,
        }),
};
