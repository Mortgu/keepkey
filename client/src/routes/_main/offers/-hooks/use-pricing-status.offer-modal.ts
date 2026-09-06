import { useQueries } from "@tanstack/react-query";
import { coordinatesFrom } from "@keepit/schemas";
import type { PriceHeader } from "@keepit/schemas";
import type { OfferModalPositionValues } from "../-schemas/offer-modal-schema";
import type { PriceSource } from "@/hooks";
import { pricingQueries } from "@/hooks/pricing/pricing-queries";
import { getErrorMessage } from "@/lib/errors";

interface Props {
    header: PriceHeader;
    source: PriceSource;
    /** Bei Verlängerung und Erweiterung das Quellangebot — Grundlage des Pins. */
    sourceOfferId: string | undefined;
    positions: Array<OfferModalPositionValues>;
}

/**
 * Ob jede Position des Angebots einen Preis hat.
 *
 * Nötig, weil ein fehlender Preis sonst folgenlos bliebe: `usePositionPrice`
 * fällt in der Anzeige auf Nullen zurück, und ohne diese Prüfung ließe sich ein
 * Angebot mit 0,00 € speichern statt an der Ursache zu scheitern. Eine
 * Kombination aus Produkt, Vertrag und Laufzeit, für die keine Zelle hinterlegt
 * ist, muss sichtbar scheitern — nicht stillschweigend 0 kosten.
 *
 * Der Fall entsteht nicht nur beim Anlegen: wird die Laufzeit im Kopf
 * nachträglich geändert, treffen bestehende Positionen eine andere Spalte der
 * Preistabelle, in der nicht jede von ihnen einen Preis haben muss.
 *
 * Die Abfragen teilen Schlüssel und Optionen mit denen der einzelnen Positionen
 * (`usePositionPrice`); es entstehen dadurch keine zusätzlichen Requests.
 *
 * Nimmt die Positionen als Wert entgegen statt die Formular-API: Letztere wird
 * aus dem Rückgabewert des aufrufenden Hooks abgeleitet, und der Bezug darauf
 * liefe hier im Kreis — TypeScript fällt dann still auf `any` zurück.
 */
export default function usePricingStatus({ header, source, sourceOfferId, positions }: Props) {
    const isPinned = source === "pinned";

    const results = useQueries({
        queries: positions.map((position) => (
            isPinned
                ? pricingQueries.pinned(
                    sourceOfferId ?? "",
                    position.sourcePositionId ?? "",
                    position.quantity,
                )
                : pricingQueries.live(coordinatesFrom(header, position))
        )),
    });

    const errors = results.map((result) => (result.error ? getErrorMessage(result.error) : null));

    return {
        /** Fehlermeldung je Position, nach Index — `null`, wenn der Preis steht. */
        errors,
        /** Solange true, ist das Angebot nicht speicherbar. */
        hasError: errors.some(Boolean),
    };
}
