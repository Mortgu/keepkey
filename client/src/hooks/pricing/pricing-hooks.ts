import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {   netCents } from "@keepit/schemas";
import { pricingQueries } from "./pricing-queries";
import type {PositionPrice, PriceCoordinates} from "@keepit/schemas";

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
    eur_user_month: 0,
    total_cents: 0,
    discount_cents: 0,
    fromSnapshot: false,
    origin: "list",
    list_eur_user_month: null,
};

interface UsePositionPriceArgs {
    source: PriceSource;
    coordinates: PriceCoordinates;
    /**
     * Quellangebot und -position. Nur bei `source: "pinned"` nötig;
     * `positionId: null`, wenn die Position keine Entsprechung im Quellangebot
     * hat.
     */
    pin?: { offerId: string; positionId: string | null };
}

/**
 * Preis einer Angebotsposition aus der angegebenen Quelle.
 *
 * Beide Quellen liefern dieselbe Form, deshalb gibt es hier nichts zu
 * normalisieren — nur auszuwählen. Die nicht gewählte Abfrage bleibt über
 * `enabled` abgeschaltet.
 */
export function usePositionPrice({ source, coordinates, pin }: UsePositionPriceArgs) {
    const isPinned = source === "pinned";

    const live = useQuery(pricingQueries.live(coordinates, !isPinned));
    const pinned = useQuery(pricingQueries.pinned(
        pin?.offerId ?? "",
        pin?.positionId ?? "",
        coordinates.quantity,
        isPinned,
    ));

    const active = isPinned ? pinned : live;
    const price = active.data ?? EMPTY_PRICE;

    return {
        price,
        /** Brutto, vor Abzug der Freimonate. */
        totalCents: price.total_cents,
        /** Brutto abzüglich der Freimonate. */
        netCents: netCents(price),
        unitCents: price.eur_user_month,
        discountCents: price.discount_cents,
        fromSnapshot: price.fromSnapshot,
        /**
         * true, wenn der Stückpreis ein für diesen Kunden hinterlegter Preis
         * ist und nicht der Listenpreis. Nur zusammen mit `hasPrice` aussagekräftig
         * — ohne Preis meldet {@link EMPTY_PRICE} "list".
         */
        isCustomerPrice: price.origin === "customer",
        /** Listenpreis derselben Koordinate; `null`, wenn dort keiner steht. */
        listUnitCents: price.list_eur_user_month,
        /**
         * false, solange kein Preis vorliegt — die Zahlen sind dann Nullen aus
         * {@link EMPTY_PRICE}. Wer aus `fromSnapshot` eine Warnung ableitet,
         * muss hierauf prüfen, sonst erscheint sie schon während des Ladens.
         */
        hasPrice: active.data !== undefined,
        /** Nur true, solange wirklich eine Anfrage läuft. */
        isLoading: active.isLoading,
        error: active.error,
    };
}

/** Alle für einen Kunden hinterlegten Preise — Grundlage des Reiters „Preise". */
export function useCustomerPrices(customerId: string) {
    const { data: prices = [], isPending, error } = useQuery(pricingQueries.customerPrices(customerId));

    return { prices, isPending, error };
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
        (coordinates: PriceCoordinates) => queryClient.fetchQuery(pricingQueries.live(coordinates)),
        [queryClient],
    );
}
