import type { PurchasePositionInput } from "@keepit/schemas";
import { AppException } from "../lib/exceptions.js";

/** Das Nötigste aus einer Snapshot-Position, um den Einkauf zu prüfen. */
export type SnapshotPositionForPurchase = {
    id: string;
};

export type PurchaseLine = {
    offerPositionId: string;
    purchase_total_cents: number;
};

/**
 * Übernimmt die eingegebenen Einkaufsbeträge einer Bestellung.
 *
 * Gespeichert wird nur der Gesamtbetrag je Position — das, was wir dem
 * Zulieferer zahlen. Freimonate gibt es nur auf der Verkaufsseite; Rabatte des
 * Zulieferers stecken bereits im eingegebenen Betrag.
 *
 * Erzwingt, dass genau die Positionen des Snapshots abgedeckt sind: keine
 * fehlt, keine ist doppelt, keine fremde dabei. Sonst stünde auf der
 * Bestellung eine andere Positionsliste als im Angebot.
 */
export function purchaseLines(
    snapshotPositions: ReadonlyArray<SnapshotPositionForPurchase>,
    input: ReadonlyArray<PurchasePositionInput>,
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

    return snapshotPositions.map((position) => ({
        offerPositionId: position.id,
        purchase_total_cents: byId.get(position.id)!.purchase_total_cents,
    }));
}

/**
 * Einzelpreis je User/Monat, nur zur Anzeige: aus dem Gesamtbetrag abgeleitet
 * und auf Cent gerundet. Maßgeblich ist immer der Gesamtbetrag.
 */
export const purchaseUnitCents = (totalCents: number, quantity: number, durationMonths: number): number =>
    quantity > 0 && durationMonths > 0 ? Math.round(totalCents / (quantity * durationMonths)) : 0;

/** Einkaufssumme: Summe der Zeilen. Pauschalen und Rabatte gehören dem Kunden. */
export const purchaseNetAmount = (lines: ReadonlyArray<Pick<PurchaseLine, "purchase_total_cents">>): number =>
    lines.reduce((sum, l) => sum + l.purchase_total_cents, 0);
