import { useQuery } from "@tanstack/react-query";
import { dashboardQueries } from "./dashboard-queries";
import type { DashboardStats } from "@keepit/schemas";

const EMPTY: DashboardStats = {
    totals: {
        offers: { count: 0, volume_cents: 0 },
        orders: { count: 0, volume_cents: 0 },
    },
    months: [],
};

/**
 * Kennzahlen des Dashboards.
 *
 * Kommt vom Server, nicht aus den geladenen Listen: die Angebotsliste ist auf
 * 50 Einträge begrenzt, und die frühere client-seitige Summe darüber wäre ab
 * dem 51. Angebot stillschweigend zu niedrig gewesen.
 */
export function useDashboardStats() {
    const { data = EMPTY, isPending, error } = useQuery(dashboardQueries.stats());

    return { stats: data.totals, months: data.months, isPending, error };
}
