import { prisma } from "../lib/prismaClient.js";

import type { DashboardMonth, DashboardStats } from "@keepit/schemas";

/** Wie viele Monate die Zeitreihe zurückreicht, den laufenden eingeschlossen. */
const MONTHS = 12;

/** Eine Zeile aus der Monatsaggregation. `count` und `volume` kommen als BigInt/Decimal zurück. */
type MonthRow = { month: string; count: bigint; volume: bigint | null };

/**
 * Das Gerüst der Zeitreihe: die letzten {@link MONTHS} Monate, ältester zuerst.
 *
 * Wird gebraucht, weil die Aggregation nur Monate liefert, in denen etwas
 * passiert ist. Ohne das Gerüst hätte die Zeitachse Löcher und ein Bestand aus
 * zwei Angeboten ergäbe einen einzelnen Punkt statt einer Kurve.
 */
function monthSpine(now: Date): string[] {
    const months: string[] = [];

    for (let offset = MONTHS - 1; offset >= 0; offset--) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
        months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
    }

    return months;
}

/** Der erste Tag des ältesten Monats der Reihe — die untere Schranke der Abfragen. */
function rangeStart(now: Date): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1), 1));
}

function toMap(rows: MonthRow[]): Map<string, { count: number; volume: number }> {
    return new Map(rows.map(row => [
        row.month,
        { count: Number(row.count), volume: Number(row.volume ?? 0) },
    ]));
}

/**
 * Kennzahlen des Dashboards: Gesamtstand und Zeitreihe der letzten Monate.
 *
 * Aggregiert in SQL statt über die geladenen Listen. Der Client hat das früher
 * selbst gerechnet — über `useOffers()`, das serverseitig auf 50 Angebote
 * begrenzt ist. Die Zahlen stimmten damit nur, solange der Bestand kleiner war.
 *
 * Gruppiert wird über `date`, das fachliche Belegdatum, nicht über `createdAt`:
 * es steht so auch auf dem Dokument. `date_trunc` gibt es in Prisma nicht,
 * deshalb Raw-SQL.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const start = rangeStart(now);
    const spine = monthSpine(now);

    const [offerRows, orderRows, openOffers, orderTotals] = await Promise.all([
        prisma.$queryRaw<MonthRow[]>`
            SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
                   count(*)                                        AS count,
                   sum("net_amount")                               AS volume
            FROM "offer"
            WHERE "date" >= ${start}
            GROUP BY 1
        `,
        prisma.$queryRaw<MonthRow[]>`
            SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
                   count(*)                                        AS count,
                   sum("net_amount")                               AS volume
            FROM "order"
            WHERE "date" >= ${start}
            GROUP BY 1
        `,
        // Offen heisst: es hängt keine Bestellung daran. `Order.offerId` ist
        // unique, ein Angebot hat also höchstens eine.
        prisma.offer.aggregate({
            where: { orders: null },
            _count: { _all: true },
            _sum: { net_amount: true },
        }),
        prisma.order.aggregate({
            _count: { _all: true },
            _sum: { net_amount: true },
        }),
    ]);

    const offersByMonth = toMap(offerRows);
    const ordersByMonth = toMap(orderRows);

    const months: DashboardMonth[] = spine.map((month) => {
        const offers = offersByMonth.get(month);
        const orders = ordersByMonth.get(month);

        return {
            month,
            offerCount: offers?.count ?? 0,
            offerVolume_cents: offers?.volume ?? 0,
            orderCount: orders?.count ?? 0,
            orderVolume_cents: orders?.volume ?? 0,
        };
    });

    return {
        totals: {
            offers: {
                count: openOffers._count._all,
                volume_cents: openOffers._sum.net_amount ?? 0,
            },
            orders: {
                count: orderTotals._count._all,
                volume_cents: orderTotals._sum.net_amount ?? 0,
            },
        },
        months,
    };
}
