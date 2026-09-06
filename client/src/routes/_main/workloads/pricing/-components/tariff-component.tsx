import { useMemo } from "react";
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

const ORPHAN_COLUMN_HINT =
    "Diese Laufzeit steht nicht in den Standardlaufzeiten — die Preise bleiben erhalten, sind im Angebot aber nicht wählbar.";

const ORPHAN_ROW_HINT =
    "Diese Mengenstufe steht nicht in den Standard-Staffeln. Die Preise bleiben erhalten, werden aber von der Staffel überdeckt, die diese Menge jetzt abdeckt — sie gelten also nicht mehr.";

export default function TariffComponent({ tariff }: Props) {
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

        const standardSet = new Set(tiers.map(t => t.min_quantity));
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
                                        title={column.orphan ? ORPHAN_COLUMN_HINT : undefined}
                                    >
                                        <p className="font-medium text-md">{column.duration} Monate</p>
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
                                            title={ORPHAN_ROW_HINT}
                                        >
                                            <span className="flex-1 tabular-nums">ab {row.min_quantity}</span>
                                            <span className="text-xs">nicht in der Staffelliste</span>
                                            <Button
                                                variant="link"
                                                size="xs"
                                                iconOnly
                                                icon={<Trash className="size-3" />}
                                                title={`Alle Preise auf Mengenstufe ${row.min_quantity} in dieser Preistabelle entfernen`}
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
