import { prisma } from "../lib/prismaClient.js";

import type { DashboardMonth, DashboardStats } from "@keepit/schemas";

const MONTHS = 12;
type MonthRow = { month: string; count: bigint; volume: bigint | null };

function monthSpine(now: Date): string[] {
    const months: string[] = [];

    for (let offset = MONTHS - 1; offset >= 0; offset--) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
        months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
    }

    return months;
}

function rangeStart(now: Date): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1), 1));
}

function toMap(rows: MonthRow[]): Map<string, { count: number; volume: number }> {
    return new Map(rows.map(row => [
        row.month,
        { count: Number(row.count), volume: Number(row.volume ?? 0) },
    ]));
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const start = rangeStart(now);
    const spine = monthSpine(now);

    const [offerRows, orderRows, openOffers, orderTotals] = await Promise.all([
        prisma.$queryRaw<MonthRow[]>`
            SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
                   count(*)                                        AS count,
                   sum("netAmount")                               AS volume
            FROM "offer"
            WHERE "date" >= ${start}
            GROUP BY 1
        `,
        prisma.$queryRaw<MonthRow[]>`
            SELECT to_char(date_trunc('month', o."date"), 'YYYY-MM') AS month,
                   count(*) AS count, sum(f."netAmount") AS volume
            FROM "order" o JOIN "offer" f ON f.id = o."offerId"
            WHERE o."date" >= ${start} AND o."cancelledAt" IS NULL
            GROUP BY 1
        `,
        prisma.offer.aggregate({
            where: { acceptedAt: null },
            _count: { _all: true },
            _sum: { netAmount: true },
        }),

        prisma.$queryRaw<{ count: bigint; volume: bigint | null }[]>`
            SELECT count(*) AS count, sum(f."netAmount") AS volume
            FROM "order" o JOIN "offer" f ON f.id = o."offerId"
            WHERE o."cancelledAt" IS NULL
        `,
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
                volume_cents: openOffers._sum.netAmount ?? 0,
            },
            orders: {
                count: Number(orderTotals[0]?.count ?? 0),
                volume_cents: Number(orderTotals[0]?.volume ?? 0),
            },
        },
        months,
    };
}
