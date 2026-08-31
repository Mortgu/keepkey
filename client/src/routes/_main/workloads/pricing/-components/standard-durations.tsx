import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Button, NumberField, RouteError, Skeleton } from "@/components";
import { useStandardDurations } from "@/hooks";
import { useCreateStandardDuration, useDeleteStandardDuration } from "@/hooks/tariffs/tariff-mutations";

/**
 * Die Laufzeiten gelten für *alle* Preistabellen und stehen deshalb über den
 * Tarifgruppen, nicht in einer davon. Nur weil sie nicht am Tarif hängen, lässt
 * sich die Laufzeit eines Angebots wählen, bevor ein Produkt feststeht.
 */
export default function StandardDurations() {
    const { durations, isPending, error } = useStandardDurations();
    const { createStandardDuration, isPending: creating, error: createError } = useCreateStandardDuration();
    const { deleteStandardDuration, isPending: deleting } = useDeleteStandardDuration();

    const [months, setMonths] = useState<number | null>(null);

    const handleAdd = () => {
        if (months === null || months <= 0) return;

        createStandardDuration(months);
        setMonths(null);
    };

    return (
        <div className="grid gap-3 border border-(--border) rounded-md bg-white px-4 py-3">
            <div className="grid gap-0.5">
                <h2 className="text-md font-medium">Standardlaufzeiten</h2>
                <p className="text-sm text-(--text-secondary)">
                    Gelten für alle Tarifgruppen und bestimmen, welche Laufzeiten in einem Angebot wählbar sind.
                </p>
            </div>

            {error && <RouteError error={error} />}
            {createError && <RouteError error={createError} />}

            <div className="flex flex-wrap items-center gap-2">
                {isPending && <Skeleton className="h-[32px] w-40" />}

                {!isPending && durations.length === 0 && (
                    <p className="text-sm text-(--text-secondary)">Noch keine Laufzeit hinterlegt.</p>
                )}

                {durations.map(duration => (
                    <span
                        key={duration.id}
                        className="flex items-center gap-1 border border-(--border) rounded-md pl-3 pr-1 py-1 text-sm tabular-nums"
                    >
                        {duration.months} Monate
                        <Button
                            variant="link"
                            size="xs"
                            iconOnly
                            icon={<Trash className="size-3" />}
                            title="Laufzeit aus der Liste entfernen"
                            disabled={deleting}
                            onClick={() => deleteStandardDuration(duration.id)}
                        />
                    </span>
                ))}
            </div>

            <div className="flex items-end gap-2">
                <div className="w-40">
                    <NumberField
                        size="xs"
                        min={1}
                        step={1}
                        label="Neue Laufzeit"
                        placeholder="Monate"
                        value={months}
                        onValueChange={(value) => setMonths(value)}
                    />
                </div>
                <Button
                    size="xs"
                    variant="border"
                    icon={<Plus className="size-3" />}
                    disabled={months === null || months <= 0}
                    loading={creating}
                    onClick={handleAdd}
                >
                    Hinzufügen
                </Button>
            </div>
        </div>
    );
}
