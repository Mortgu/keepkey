import { z } from "zod";

/**
 * Ein Monat der Zeitreihe.
 *
 * `month` ist `YYYY-MM` — bewusst ein String und kein Datum: er ist ein
 * Gruppierungsschlüssel, kein Zeitpunkt, und überlebt die JSON-Serialisierung
 * ohne Zeitzonenfrage.
 *
 * Beträge in Cent, wie überall sonst auch.
 */
export const dashboardMonthSchema = z.object({
    month: z.string(),

    offerCount: z.number().int(),
    offerVolume_cents: z.number().int(),

    orderCount: z.number().int(),
    orderVolume_cents: z.number().int(),
});
export type DashboardMonth = z.infer<typeof dashboardMonthSchema>;

export const dashboardTotalSchema = z.object({
    count: z.number().int(),
    volume_cents: z.number().int(),
});
export type DashboardTotal = z.infer<typeof dashboardTotalSchema>;

/**
 * Kennzahlen des Dashboards.
 *
 * Serverseitig aggregiert statt aus den geladenen Listen gerechnet: die
 * Angebotsliste ist auf 50 Einträge begrenzt, eine Summe darüber wäre ab dem
 * 51. Angebot stillschweigend zu niedrig.
 *
 * `months` ist lückenlos — Monate ohne Beleg stehen mit Nullen drin, sonst
 * hätte die Zeitachse Löcher.
 */
export const dashboardStatsSchema = z.object({
    totals: z.object({
        /** Angebote, aus denen noch keine Bestellung entstanden ist. */
        offers: dashboardTotalSchema,
        orders: dashboardTotalSchema,
    }),
    months: z.array(dashboardMonthSchema),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
