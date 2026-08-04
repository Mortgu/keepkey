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
    columns: Array<{ id: string; duration: number }>;
    rows: Array<{ id: string; min_quantity: number; max_quantity: number | null }>;
    cells: Array<{ rowId: string; columnId: string; default_cells: Array<{ price: number }> }>;
}

/**
 * Normalisiert einen geladenen Tarif zu einem Snapshot: Spalten nach Laufzeit,
 * Zeilen nach Mengenuntergrenze, Zellen nach (Laufzeit, Menge) sortiert. Ohne
 * cuids, ohne Timestamps und ohne Kundenpreise — letztere hängen an
 * `TariffCustomerPrice` und sind nicht Teil der Version.
 */
export function buildTariffVersionSnapshot(tariff: TariffForSnapshot): TariffVersionSnapshot {
    const durationByColumnId = new Map(tariff.columns.map((column) => [column.id, column.duration]));
    const minQuantityByRowId = new Map(tariff.rows.map((row) => [row.id, row.min_quantity]));

    const cells = tariff.cells.flatMap((cell) => {
        const duration = durationByColumnId.get(cell.columnId);
        const min_quantity = minQuantityByRowId.get(cell.rowId);

        // Verwaiste Zelle (Zeile oder Spalte existiert nicht mehr) — überspringen.
        if (duration === undefined || min_quantity === undefined) return [];

        return [{ duration, min_quantity, price: cell.default_cells[0]?.price ?? null }];
    });

    return tariffVersionSnapshotSchema.parse({
        columns: [...tariff.columns]
            .sort((a, b) => a.duration - b.duration)
            .map(({ duration }) => ({ duration })),
        rows: [...tariff.rows]
            .sort((a, b) => a.min_quantity - b.min_quantity)
            .map(({ min_quantity, max_quantity }) => ({ min_quantity, max_quantity })),
        cells: cells.sort((a, b) => a.duration - b.duration || a.min_quantity - b.min_quantity),
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
 * erwartet. Die synthetischen Ids sind aus den Koordinaten abgeleitet und damit
 * innerhalb des Snapshots eindeutig; sie verlassen diese Funktion nie.
 *
 * Zellen ohne Default-Preis bleiben erhalten, aber mit leerem `default_cells` —
 * so bleibt die Unterscheidung zwischen `NO_CELL` und `NO_DEFAULT` erhalten.
 */
export function tariffFromSnapshot(
    snapshot: TariffVersionSnapshot,
    customerPrices: TariffForPricing["customerPrices"] = [],
): TariffForPricing {
    return {
        columns: snapshot.columns.map((column) => ({
            id: `c:${column.duration}`,
            duration: column.duration,
        })),
        rows: snapshot.rows.map((row) => ({
            id: `r:${row.min_quantity}`,
            min_quantity: row.min_quantity,
            max_quantity: row.max_quantity,
        })),
        cells: snapshot.cells.map((cell) => ({
            id: `cell:${cell.duration}:${cell.min_quantity}`,
            rowId: `r:${cell.min_quantity}`,
            columnId: `c:${cell.duration}`,
            default_cells: cell.price === null ? [] : [{ price: cell.price }],
        })),
        customerPrices,
    };
}
