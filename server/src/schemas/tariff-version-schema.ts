import { createHash } from "node:crypto";

import { tariffVersionSnapshotSchema, type TariffVersionSnapshot } from "@keepit/schemas";

import type { TariffForPricing } from "../utils/products.js";

/**
 * Die Form des Snapshots liegt in `@keepit/schemas` — sie beschreibt sowohl das
 * Persistenzformat als auch die API-Antwort und darf deshalb nur einmal
 * existieren. Hier bleibt nur, was serverseitig ist: bauen, hashen (`node:crypto`
 * läuft nicht im Browser) und wieder zu einer bepreisbaren Form hydrieren.
 *
 * Bewusst koordinatenbasiert statt id-basiert: Zellen werden über
 * (duration, min_quantity) adressiert, nicht über cuids. Dadurch ist der
 * Snapshot zugleich wiederherstellbar, lesbar und stabil hashbar — ein Restore
 * erzeugt denselben Hash wie die Version, aus der er stammt, obwohl alle
 * Datenbank-Ids neu vergeben wurden.
 */
export type { TariffVersionSnapshot };

/** Minimale Tarif-Form, die {@link buildTariffVersionSnapshot} benötigt. */
export interface TariffForSnapshot {
    /** Die Mengenstaffeln der Tarifgruppe — nur sie kennen die Obergrenzen. */
    tiers: Array<{ min_quantity: number; max_quantity: number | null }>;
    cells: Array<{ duration: number; min_quantity: number; price: number }>;
}

/**
 * Normalisiert einen geladenen Tarif zu einem Snapshot: Spalten nach Laufzeit,
 * Zeilen nach Mengenuntergrenze, Zellen nach (Laufzeit, Menge) sortiert. Ohne
 * Timestamps und ohne Kundenpreise — letztere hängen an
 * `TariffCustomerPrice` und sind nicht Teil der Version.
 *
 * Die Snapshot-Form ist bewusst unverändert geblieben, obwohl das Live-Modell
 * keine Spalten- und Zeilentabellen mehr hat: der sha256 darüber ist die
 * Preisgrundlage jeder angepinnten Position und darf sich nicht verschieben.
 * `columns` sind deshalb die Laufzeiten, die dieser Tarif tatsächlich bepreist
 * — dieselbe Menge, die vorher als Spalten in der Datenbank stand.
 */
export function buildTariffVersionSnapshot(tariff: TariffForSnapshot): TariffVersionSnapshot {
    const durations = [...new Set(tariff.cells.map((cell) => cell.duration))].sort((a, b) => a - b);

    return tariffVersionSnapshotSchema.parse({
        columns: durations.map((duration) => ({ duration })),
        rows: [...tariff.tiers]
            .sort((a, b) => a.min_quantity - b.min_quantity)
            .map(({ min_quantity, max_quantity }) => ({ min_quantity, max_quantity })),
        cells: [...tariff.cells]
            .sort((a, b) => a.duration - b.duration || a.min_quantity - b.min_quantity)
            .map(({ duration, min_quantity, price }) => ({ duration, min_quantity, price })),
    });
}

/**
 * Kanonische Serialisierung als Tupel-Arrays — dadurch ist der Hash unabhängig
 * von der Schlüsselreihenfolge, die JSON.stringify auf Objekten mitschleppt.
 */
function canonicalize(snapshot: TariffVersionSnapshot): string {
    return JSON.stringify({
        columns: snapshot.columns.map((column) => [column.duration]),
        rows: snapshot.rows.map((row) => [row.min_quantity, row.max_quantity]),
        cells: snapshot.cells.map((cell) => [cell.duration, cell.min_quantity, cell.price]),
    });
}

/** sha256 über die kanonisierte Form — Grundlage der Versions-Deduplizierung. */
export function hashTariffSnapshot(snapshot: TariffVersionSnapshot): string {
    return createHash("sha256").update(canonicalize(snapshot)).digest("hex");
}

export function parseTariffVersionSnapshot(value: unknown): TariffVersionSnapshot {
    return tariffVersionSnapshotSchema.parse(value);
}

/**
 * Hydriert einen Snapshot zu der Form, die {@link import('../utils/products.js').selectPrice}
 * erwartet.
 *
 * Zellen ohne Preis fallen weg. Alte Snapshots konnten sie tragen (`price: null`);
 * sie liefen dort als `NO_DEFAULT` auf und laufen jetzt als `NO_CELL` — beides
 * heißt „nicht konfiguriert", der gerechnete Preis ändert sich nicht.
 */
export function tariffFromSnapshot(
    snapshot: TariffVersionSnapshot,
    customerPrices: TariffForPricing["customerPrices"] = [],
): TariffForPricing {
    return {
        tiers: snapshot.rows.map((row) => ({
            min_quantity: row.min_quantity,
            max_quantity: row.max_quantity,
        })),
        cells: snapshot.cells.flatMap((cell) =>
            cell.price === null
                ? []
                : [{ duration: cell.duration, min_quantity: cell.min_quantity, price: cell.price }],
        ),
        customerPrices,
    };
}
