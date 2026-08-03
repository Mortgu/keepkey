import type { CreateOfferPositionInput } from "@keepit/schemas";
import type { DerivedMode } from "./use-derived-form";
import { useExtensionPrice, usePrice } from "@/hooks";

interface Props {
    mode: DerivedMode;
    /** Quellangebot — nur im Extension-Modus benötigt. */
    offerId: string;
    customerId: string;
    /** Id der Quellposition; null, wenn die Position keine Entsprechung hat. */
    sourcePositionId: string | null;
    /** Laufzeit, Menge und Freimonate, für die der Preis gelten soll. */
    position: Pick<CreateOfferPositionInput,
        "productId" | "contractId" | "duration_months" | "quantity" | "free_months" | "optional">;
}

/**
 * Liefert den Preis einer Position je nach Angebotstyp aus der passenden Quelle:
 *
 * - `renewal` fragt den **Live-Tarif** ab — eine Verlängerung soll die aktuellen
 *   Konditionen zeigen.
 * - `extension` fragt die **eingefrorene Tarif-Version** der Quellposition ab,
 *   damit der Preis von damals gilt. Weil dort die vollständige Preistabelle
 *   liegt, greift auch bei geänderter Menge die richtige Staffel.
 *
 * `fromSnapshot: false` meldet, dass die Quellposition keinen Pin hat und flach
 * mit ihrem gespeicherten Stückpreis gerechnet wurde.
 */
export default function useDerivedPositionPrice({
    mode, offerId, customerId, sourcePositionId, position,
}: Props) {
    const isExtension = mode === "extension";

    const live = usePrice(
        isExtension ? "" : customerId,
        {
            ...position,
            total_cents: 0,
            eur_user_month: 0,
            discount_cents: 0,
        },
    );

    const frozen = useExtensionPrice(
        isExtension ? offerId : "",
        isExtension ? (sourcePositionId ?? "") : "",
        position.quantity,
    );

    if (isExtension) {
        return {
            totalCents: frozen.price?.total_cents ?? 0,
            unitCents: frozen.price?.eur_user_month ?? 0,
            isPending: frozen.isPending,
            fromSnapshot: frozen.price?.fromSnapshot ?? true,
        };
    }

    return {
        totalCents: live.price?.price ?? 0,
        unitCents: live.price?.breakdown.unitPrice ?? 0,
        isPending: live.isPending,
        fromSnapshot: true,
    };
}
