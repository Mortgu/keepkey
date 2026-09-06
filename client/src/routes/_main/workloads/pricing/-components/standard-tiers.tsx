import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Button, NumberField, RouteError, Skeleton } from "@/components";
import { useStandardTiers } from "@/hooks";
import { useCreateStandardTier, useDeleteStandardTier } from "@/hooks/tariffs/tariff-mutations";

/**
 * Die Mengenachse aller Preistabellen — Gegenstück zu den Standardlaufzeiten.
 * Beide Achsen gelten global; je Tarif unterscheiden sich nur die Preise.
 */
export default function StandardTiers() {
    const { tiers, isPending, error } = useStandardTiers();
    const { createTier, isPending: creating, error: createError } = useCreateStandardTier();
    const { deleteTier, isPending: deleting, error: deleteError } = useDeleteStandardTier();

    const [min, setMin] = useState<number | null>(null);
    const [max, setMax] = useState<number | null>(null);

    const handleAdd = async () => {
        if (min === null || min <= 0) return;

        await createTier({ min_quantity: min, max_quantity: max });
        setMin(null);
        setMax(null);
    };

    return (
        <div className="grid gap-3 border border-(--border) rounded-md bg-white px-4 py-3">
            <div className="grid gap-0.5">
                <h2 className="text-md font-medium">Standard-Mengenstaffeln</h2>
                <p className="text-sm text-(--text-secondary)">
                    Gelten für alle Preistabellen. Eine Staffel zu entfernen löscht keine hinterlegten
                    Preise — sie sind nur nicht mehr erreichbar, bis die Staffel zurückkommt.
                </p>
            </div>

            {error && <RouteError error={error} />}
            {createError && <RouteError error={createError} />}
            {deleteError && <RouteError error={deleteError} />}

            <div className="flex flex-wrap items-center gap-2">
                {isPending && <Skeleton className="h-[32px] w-40" />}

                {!isPending && tiers.length === 0 && (
                    <p className="text-sm text-(--text-secondary)">Noch keine Staffel hinterlegt.</p>
                )}

                {tiers.map(tier => (
                    <span
                        key={tier.id}
                        className="flex items-center gap-1 border border-(--border) rounded-md pl-3 pr-1 py-1 text-sm tabular-nums"
                    >
                        {tier.min_quantity} – {tier.max_quantity ?? "∞"}

                        {/* Was auf der Stufe liegt, muss *vor* dem Klick zu sehen
                            sein: entfernt wird ohne Rückfrage, und die Preise
                            werden danach von der Nachbarstaffel überdeckt. */}
                        {tier.priceCount > 0 && (
                            <span className="text-(--text-secondary)">
                                · {tier.priceCount} {tier.priceCount === 1 ? "Preis" : "Preise"}
                            </span>
                        )}

                        <Button
                            variant="link"
                            size="xs"
                            iconOnly
                            icon={<Trash className="size-3" />}
                            title={tier.priceCount > 0
                                ? `Staffel entfernen. Die ${tier.priceCount} Preise auf dieser Stufe bleiben erhalten, gelten aber nicht mehr — die dann greifende Nachbarstaffel liefert ihren eigenen Preis.`
                                : "Staffel aus der Liste entfernen"}
                            disabled={deleting}
                            onClick={() => deleteTier(tier.id)}
                        />
                    </span>
                ))}
            </div>

            <div className="flex items-end gap-2">
                <div className="w-32">
                    <NumberField size="xs" min={1} step={1} label="Ab Menge" value={min}
                        onValueChange={(value) => setMin(value)} />
                </div>
                <div className="w-32">
                    <NumberField size="xs" min={1} step={1} label="Bis" placeholder="∞" value={max}
                        onValueChange={(value) => setMax(value)} />
                </div>
                <Button
                    size="xs"
                    variant="border"
                    icon={<Plus className="size-3" />}
                    disabled={min === null || min <= 0}
                    loading={creating}
                    onClick={handleAdd}
                >
                    Hinzufügen
                </Button>
            </div>
        </div>
    );
}
