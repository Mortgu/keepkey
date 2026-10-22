import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trash } from "lucide-react";
import TariffCellComponent from "./cell-component";
import TariffTierComponent from "./tier-component";
import type { TariffBase } from "@keepit/schemas";
import { useDeleteTariffCell } from "@/hooks/tariffs/tariff-mutations";
import { useStandardDurations, useStandardTiers } from "@/hooks";
import { Button } from "@/components";

type Props = {
    tariff: TariffBase;
};

export default function TariffComponent({ tariff }: Props) {
    const { t } = useTranslation();
    const { deleteCell } = useDeleteTariffCell();
    const { durations: standardDurations } = useStandardDurations();
    const { tiers } = useStandardTiers();

    const groupId = tariff.tariffGroupId;

    /**
     * Die Spaltenachse sind die Standardlaufzeiten. Laufzeiten, für die dieser
     * Tarif noch Preise trägt, die aber nicht (mehr) in der Liste stehen, kommen
     * hinten dran — sonst verschwänden hinterlegte Preise unbemerkt.
     */
    const columns = useMemo(() => {
        const standard = standardDurations.map(d => d.months);
        const standardSet = new Set(standard);
        const orphans = [...new Set(tariff.cells.map(c => c.duration))]
            .filter(duration => !standardSet.has(duration))
            .sort((a, b) => a - b);

        return [
            ...[...standard].sort((a, b) => a - b).map(duration => ({ duration, orphan: false })),
            ...orphans.map(duration => ({ duration, orphan: true })),
        ];
    }, [standardDurations, tariff.cells]);

    /**
     * Dasselbe für die Mengenachse — und hier wiegt es schwerer als bei den
     * Spalten. Eine Spalte wird über die Laufzeit exakt getroffen; eine Zeile
     * über einen *Bereich*. Fällt eine Mengenstufe aus der Staffelliste, decken
     * die Nachbarstaffeln ihren Bereich mit ab und liefern ab dann deren Preis.
     * Ohne diese Zeile passierte das unsichtbar.
     */
    const rows = useMemo(() => {
        const standard = [...tiers]
            .sort((a, b) => a.min_quantity - b.min_quantity)
            .map(tier => ({
                key: tier.id,
                tierId: tier.id,
                min_quantity: tier.min_quantity,
                max_quantity: tier.max_quantity,
            }));

        const standardSet = new Set(tiers.map(tier => tier.min_quantity));
        const orphans = [...new Set(tariff.cells.map(c => c.min_quantity))]
            .filter(min_quantity => !standardSet.has(min_quantity))
            .sort((a, b) => a - b)
            .map(min_quantity => ({
                key: `orphan:${min_quantity}`,
                tierId: null,
                min_quantity,
                max_quantity: null,
            }));

        return [...standard, ...orphans];
    }, [tiers, tariff.cells]);

    const priceAt = useMemo(() => {
        const map = new Map(tariff.cells.map(cell => [`${cell.duration}:${cell.min_quantity}`, cell.price]));
        return (duration: number, min_quantity: number) => map.get(`${duration}:${min_quantity}`) ?? null;
    }, [tariff.cells]);

    return (
        <div className="">
            <div className="flex items-center">
                <table className="w-full">
                    <thead className="h-[41px] border-b border-(--border)">
                        <tr className="">
                            <th className="border-r border-(--border)" />

                            {columns.map(column => (
                                <th key={column.duration} className="px-3 py-1 last:border-r-0 border-r border-(--border)">
                                    <div
                                        className={column.orphan ? "text-(--text-secondary)" : undefined}
                                        title={column.orphan ? t("workloads.pricing.orphan.columnHint") : undefined}
                                    >
                                        <p className="font-medium text-md">{t("workloads.pricing.months", { count: column.duration })}</p>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(row => (
                            <tr
                                key={row.key}
                                className={`h-[41px] border-b border-(--border) ${row.tierId === null ? "text-(--text-secondary)" : ""}`}
                            >
                                {row.tierId !== null ? (
                                    <TariffTierComponent
                                        tierId={row.tierId}
                                        minQty={row.min_quantity}
                                        maxQty={row.max_quantity}
                                    />
                                ) : (
                                    <td>
                                        <div
                                            className="flex items-center gap-2 px-3 py-1"
                                            title={t("workloads.pricing.orphan.rowHint")}
                                        >
                                            <span className="flex-1 tabular-nums">{t("workloads.pricing.orphan.from", { min: row.min_quantity })}</span>
                                            <span className="text-xs">{t("workloads.pricing.orphan.notInTiers")}</span>
                                            <Button
                                                variant="link"
                                                size="xs"
                                                iconOnly
                                                icon={<Trash className="size-3" />}
                                                title={t("workloads.pricing.orphan.remove", { min: row.min_quantity })}
                                                onClick={() => deleteCell({
                                                    groupId,
                                                    tariffId: tariff.id,
                                                    min_quantity: row.min_quantity,
                                                })}
                                            />
                                        </div>
                                    </td>
                                )}

                                {columns.map(column => (
                                    <TariffCellComponent
                                        key={`${column.duration}:${row.min_quantity}`}
                                        groupId={groupId}
                                        tariffId={tariff.id}
                                        duration={column.duration}
                                        minQuantity={row.min_quantity}
                                        price={priceAt(column.duration, row.min_quantity)}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
