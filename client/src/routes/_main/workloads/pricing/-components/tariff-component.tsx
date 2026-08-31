import { Plus } from "lucide-react";
import { useMemo } from "react";
import TariffCellComponent from "./cell-component";
import TariffTierComponent from "./tier-component";
import type { TariffBase, TariffTier } from "@keepit/schemas";
import { useCreateTariffTier } from "@/hooks/tariffs/tariff-mutations";
import { useStandardDurations } from "@/hooks";
import { Button } from "@/components";

type Props = {
    tariff: TariffBase;
    /** Die Mengenstaffeln der Gruppe — sie gehören nicht dem einzelnen Tarif. */
    tiers: Array<TariffTier>;
};

/**
 * Nächste freie Mengenstaffel: hängt lückenlos hinten an. Ist die letzte Staffel
 * nach oben offen, gibt es hinter ihr keinen Platz — sie wird deshalb zuerst
 * begrenzt und die neue übernimmt den offenen Rest.
 */
function nextTier(tiers: Array<TariffTier>) {
    const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
    const last = sorted.at(-1);

    if (!last) return { min_quantity: 1, max_quantity: null, boundFor: null };
    if (last.max_quantity === null) {
        const boundary = last.min_quantity + 9;
        return { min_quantity: boundary + 1, max_quantity: null, boundFor: { tier: last, boundary } };
    }
    return { min_quantity: last.max_quantity + 1, max_quantity: null, boundFor: null };
}

export default function TariffComponent({ tariff, tiers }: Props) {
    const { createTier } = useCreateTariffTier();
    const { durations: standardDurations } = useStandardDurations();

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

        if (next.boundFor) {
            await createTier({ groupId, min_quantity: next.min_quantity, max_quantity: null });
            return;
        }

        await createTier({ groupId, min_quantity: next.min_quantity, max_quantity: next.max_quantity });
    };

    return (
        <div className="border-b border-(--border)">
            <div className="flex items-center">
                <table className="w-full">
                    <thead className="h-fit">
                        <tr className="border-b border-(--border) bg-(--subtle-50)">
                            <th className="border-r border-(--border)" />

                            {columns.map(column => (
                                <th key={column.duration} className="border-r border-(--border) px-3 py-1">
                                    <div
                                        className={column.orphan ? "text-(--text-secondary)" : undefined}
                                        title={column.orphan
                                            ? "Diese Laufzeit steht nicht in den Standardlaufzeiten — die Preise bleiben erhalten, sind im Angebot aber nicht wählbar."
                                            : undefined}
                                    >
                                        {column.duration} Monate
                                    </div>
                                </th>
                            ))}

                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {sortedTiers.map(tier => (
                            <tr key={tier.id}>
                                <TariffTierComponent groupId={groupId} tierId={tier.id}
                                    minQty={tier.min_quantity} maxQty={tier.max_quantity} />

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

                                <td />
                            </tr>
                        ))}

                        <tr>
                            <td className="border-b border-r border-(--border)">
                                <Button variant="secondary" size="xs" className="w-full px-4 py-1 border-none rounded-none"
                                    title="Mengenstaffel hinzufügen — gilt für alle Verträge dieser Gruppe"
                                    onClick={handleAddTier}
                                    icon={<Plus className="size-4" />} iconOnly />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
