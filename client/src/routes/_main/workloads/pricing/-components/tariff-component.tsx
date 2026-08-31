import { useMemo } from "react";
import TariffCellComponent from "./cell-component";
import TariffTierComponent from "./tier-component";
import type { StandardTier, TariffBase } from "@keepit/schemas";
import { useCreateStandardTier } from "@/hooks/tariffs/tariff-mutations";
import { useStandardDurations, useStandardTiers } from "@/hooks";

type Props = {
    tariff: TariffBase;
};

/**
 * Nächste freie Mengenstaffel: hängt lückenlos hinten an. Ist die letzte Staffel
 * nach oben offen, gibt es hinter ihr keinen Platz — sie wird deshalb zuerst
 * begrenzt und die neue übernimmt den offenen Rest.
 */
function nextTier(tiers: Array<StandardTier>) {
    const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
    const last = sorted.at(-1);

    if (!last) return { min_quantity: 1, max_quantity: null, boundFor: null };
    if (last.max_quantity === null) {
        const boundary = last.min_quantity + 9;
        return { min_quantity: boundary + 1, max_quantity: null, boundFor: { tier: last, boundary } };
    }
    return { min_quantity: last.max_quantity + 1, max_quantity: null, boundFor: null };
}

export default function TariffComponent({ tariff }: Props) {
    const { createTier } = useCreateStandardTier();
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

    const priceAt = useMemo(() => {
        const map = new Map(tariff.cells.map(cell => [`${cell.duration}:${cell.min_quantity}`, cell.price]));
        return (duration: number, min_quantity: number) => map.get(`${duration}:${min_quantity}`) ?? null;
    }, [tariff.cells]);

    const sortedTiers = useMemo(
        () => [...tiers].sort((a, b) => a.min_quantity - b.min_quantity),
        [tiers],
    );

    const handleAddTier = async () => {
        const next = nextTier(tiers);

        await createTier({ min_quantity: next.min_quantity, max_quantity: next.max_quantity });
    };

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
                                        title={column.orphan
                                            ? "Diese Laufzeit steht nicht in den Standardlaufzeiten — die Preise bleiben erhalten, sind im Angebot aber nicht wählbar."
                                            : undefined}
                                    >
                                        <p className="font-medium text-md">{column.duration} Monate</p>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {sortedTiers.map(tier => (
                            <tr key={tier.id} className="h-[41px] border-b border-(--border)">
                                <TariffTierComponent
                                    tierId={tier.id}
                                    minQty={tier.min_quantity}
                                    maxQty={tier.max_quantity}
                                />

                                {columns.map(column => (
                                    <TariffCellComponent
                                        key={`${column.duration}:${tier.min_quantity}`}
                                        groupId={groupId}
                                        tariffId={tariff.id}
                                        duration={column.duration}
                                        minQuantity={tier.min_quantity}
                                        price={priceAt(column.duration, tier.min_quantity)}
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
