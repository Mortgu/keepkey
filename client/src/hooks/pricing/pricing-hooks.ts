import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { pricingQueries } from "./pricing-queries";
import { type LivePriceQuery, type PinnedPriceQuery, type PositionPrice } from "@keepit/schemas";

/**
 * Woher der Preis einer Position kommt:
 *
 * - `live` — der aktuell gültige Tarif. Gilt für neue Angebote und für
 *   Verlängerungen, die die heutigen Konditionen zeigen sollen.
 * - `pinned` — die Tarif-Version, die die Quellposition angepinnt hat. Gilt für
 *   Lizenzerweiterungen, in denen der Preis von damals weiterläuft.
 */
export type PriceSource = "live" | "pinned";

const EMPTY_PRICE: PositionPrice = {
    total: 0,
    totalDiscounted: 0,
    unit: 0,
    discount: 0
};

interface UsePositionPriceArgs {
    source: PriceSource;
    query: LivePriceQuery | PinnedPriceQuery;
}

export function useLivePositionPrice(props: LivePriceQuery, enabled: boolean = true): { isPending: boolean; result?: PositionPrice; error: Error | null; } {
    const { data: result, isPending, error } = useQuery(pricingQueries.live(props, enabled));
    return {
        result,
        isPending,
        error,
    };
}

export function usePinnedPositionPrice(props: PinnedPriceQuery, enabled: boolean = true): { isPending: boolean; result?: PositionPrice; error: Error | null; } {
    const { data: result, isPending, error } = useQuery(pricingQueries.pinned(props, enabled));

    return {
        result,
        isPending,
        error,
    };
}

/**
 * Preis einer Angebotsposition aus der angegebenen Quelle.
 *
 * Beide Quellen liefern dieselbe Form, deshalb gibt es hier nichts zu
 * normalisieren — nur auszuwählen. Die nicht gewählte Abfrage bleibt über
 * `enabled` abgeschaltet.
 */
export function usePositionPrice({ source, query }: UsePositionPriceArgs): { isPending: boolean; error: Error | null; result?: PositionPrice } {
    const isPinned = source === "pinned";

    const live = useLivePositionPrice(query as LivePriceQuery, !isPinned);
    const pinned = usePinnedPositionPrice(query as PinnedPriceQuery, isPinned);

    const active = isPinned ? pinned : live;

    const price = active.result ?? EMPTY_PRICE;

    return {
        isPending: active.isPending,
        error: active.error,
        result: price,
    };
}

/**
 * Holt einen Live-Preis imperativ — für den Moment des Speicherns, in dem kein
 * Hook mehr greift.
 *
 * Geht über den Query-Cache statt über einen eigenen Request: die Vorschau im
 * Formular hat denselben Preis meist schon geladen.
 */
export function usePriceResolver() {
    const queryClient = useQueryClient();

    return useCallback(
        (query: LivePriceQuery) => queryClient.fetchQuery(pricingQueries.live(query)),
        [queryClient],
    );
}
