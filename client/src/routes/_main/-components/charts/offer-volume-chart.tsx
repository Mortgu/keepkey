import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis } from "recharts";
import ChartCard from "./chart-card";
import { monthLabel } from "./month-label";
import type { DashboardMonth } from "@keepit/schemas";
import { useLocale } from "@/hooks";
import { centsToEur, formatEur } from "@/utils/utils";

interface Props {
    months: Array<DashboardMonth>;
}

/**
 * Angebotsvolumen je Monat.
 *
 * Rechnet die Cent für die Achse in Euro um: Recharts skaliert die Achse über
 * den Rohwert, und in Cent stünden dort Zahlen, die niemand liest. Formatiert
 * wird trotzdem über {@link formatEur}, damit im Tooltip dieselbe Schreibweise
 * steht wie überall sonst.
 */
export default function OfferVolumeChart({ months }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const data = months.map(month => ({
        label: monthLabel(month.month, locale),
        cents: month.offerVolume_cents,
        volume: centsToEur(month.offerVolume_cents),
    }));

    const total = months.reduce((sum, month) => sum + month.offerVolume_cents, 0);

    return (
        <ChartCard
            title={t("dashboard.charts.offerVolume.title")}
            description={t("dashboard.charts.offerVolume.description")}
            value={formatEur(total)}
            valueLabel={t("dashboard.charts.offerVolume.valueLabel")}
        >
            <AreaChart
                className="w-full h-45"
                responsive
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
                <CartesianGrid vertical horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />

                <defs>
                    {/* Die Id muss eindeutig bleiben: zwei Verläufe mit demselben
                        Namen im Dokument überschreiben einander. */}
                    <linearGradient id="offerVolumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="20%" stopColor="var(--primary-800)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary-800)" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--neutral-400)" }}
                    interval="preserveStartEnd"
                />

                <Tooltip
                    formatter={(_value, _name, item) => [
                        formatEur((item.payload as { cents: number }).cents),
                        t("dashboard.charts.offerVolume.title"),
                    ]}
                />

                <Area
                    type="linear"
                    dataKey="volume"
                    stroke="var(--primary-800)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#offerVolumeFill)"
                    isAnimationActive={false}
                />
            </AreaChart>
        </ChartCard>
    );
}
