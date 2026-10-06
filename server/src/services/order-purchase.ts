import type { PurchasePositionInput } from "@keepit/schemas";
import { AppException } from "../lib/exceptions.js";

/** Das Nötigste aus einer Snapshot-Position, um den Einkauf zu rechnen. */
export type SnapshotPositionForPurchase = {
    id: string;
    productId: string;
    quantity: number;
    free_months: number;
    eur_user_month: number;
};

export type PurchaseLine = {
    offerPositionId: string;
    purchase_eur_user_month: number;
    purchase_total_cents: number;
    purchase_discount_cents: number;
};

/**
 * Rechnet die Einkaufszeilen einer Bestellung aus den eingegebenen Preisen.
 *
 * Dieselben zwei Formeln wie beim Verkaufspreis (`offer-pricing.ts`):
 *   total    = eur_user_month × Menge × Laufzeit
 *   discount = eur_user_month × Menge × Freimonate
 * Bewusst kopiert statt geteilt — die Einkaufsseite soll sich unabhängig
 * ändern dürfen.
 *
 * Erzwingt, dass genau die Positionen des Snapshots abgedeckt sind: keine
 * fehlt, keine ist doppelt, keine fremde dabei. Sonst stünde auf der
 * Bestellung eine andere Positionsliste als im Angebot.
 */
export function purchaseLines(
    snapshotPositions: ReadonlyArray<SnapshotPositionForPurchase>,
    input: ReadonlyArray<PurchasePositionInput>,
    durationMonths: number,
): PurchaseLine[] {
    const byId = new Map(input.map((p) => [p.offerPositionId, p]));
    if (byId.size !== input.length) {
        throw new AppException("Duplicate purchase position.", 422, "PURCHASE_POSITIONS_MISMATCH");
    }

    const expected = new Set(snapshotPositions.map((p) => p.id));
    const unknown = input.find((p) => !expected.has(p.offerPositionId));
    const missing = snapshotPositions.find((p) => !byId.has(p.id));
    if (unknown || missing) {
        throw new AppException(
            "Purchase prices must cover exactly the positions of the accepted offer.",
            422,
            "PURCHASE_POSITIONS_MISMATCH",
        );
    }

    return snapshotPositions.map((position) => {
        const price = byId.get(position.id)!.purchase_eur_user_month;
        return {
            offerPositionId: position.id,
            purchase_eur_user_month: price,
            purchase_total_cents: price * position.quantity * durationMonths,
            purchase_discount_cents: price * position.quantity * position.free_months,
        };
    });
}

/** Netto-Einkaufssumme: Zeilen abzüglich Freimonate. Pauschalen und Rabatte gehören dem Kunden. */
export const purchaseNetAmount = (lines: ReadonlyArray<Pick<PurchaseLine, "purchase_total_cents" | "purchase_discount_cents">>): number =>
    lines.reduce((sum, l) => sum + l.purchase_total_cents - l.purchase_discount_cents, 0);
