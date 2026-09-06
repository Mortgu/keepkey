import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./chart-card";
import { monthLabel } from "./month-label";
import type { DashboardMonth } from "@keepit/schemas";
import { useLocale } from "@/hooks";

interface Props {
    months: Array<DashboardMonth>;
}

/**
 * Angebote gegen Bestellungen je Monat.
 *
 * Nebeneinander statt gestapelt: eine Bestellung entsteht *aus* einem Angebot,
 * gestapelt läse sich die Summe wie ein Gesamtvolumen und zählte dasselbe
 * Geschäft doppelt.
 */
export default function OffersOrdersChart({ months }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const data = months.map(month => ({
        label: monthLabel(month.month, locale),
        offers: month.offerCount,
        orders: month.orderCount,
    }));

    const offers = months.reduce((sum, month) => sum + month.offerCount, 0);
    const orders = months.reduce((sum, month) => sum + month.orderCount, 0);

    return (
        <ChartCard
            title={t("dashboard.charts.offersOrders.title")}
            description={t("dashboard.charts.offersOrders.description")}
            value={`${orders} / ${offers}`}
            valueLabel={t("dashboard.charts.offersOrders.valueLabel")}
        >
            <BarChart
                className="w-full h-45"
                responsive
                data={data}
                margin={{ top: 20, right: 15, left: 0, bottom: 0 }}
            >
                <CartesianGrid vertical={false} horizontal strokeDasharray="3 3" stroke="var(--border)" />

                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--neutral-400)" }}
                    interval="preserveStartEnd"
                />

                {/* Anzahlen sind ganzzahlig — ohne `allowDecimals` beschriftet
                    Recharts die Achse bei kleinen Werten mit 0,5er-Schritten. */}
                <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fontSize: 11, fill: "var(--neutral-400)" }}
                />

                <Tooltip cursor={{ fill: "var(--subtle-50)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />

                <Bar
                    dataKey="offers"
                    name={t("dashboard.charts.offersOrders.offers")}
                    fill="var(--primary-900)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                />
                <Bar
                    dataKey="orders"
                    name={t("dashboard.charts.offersOrders.orders")}
                    fill="var(--primary-400)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                />
            </BarChart>
        </ChartCard>
    );
}
