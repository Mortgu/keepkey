import { useStore } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { priceSourceFor } from "../hook/use-derived-form";
import type { DerivedFormApi, DerivedMode } from "../hook/use-derived-form";
import { Button, Input, Select } from "@/components";
import { usePositionPrice, useTariffDurationsHook } from "@/hooks";
import { formatEur } from "@/utils/utils";

interface Props {
    form: DerivedFormApi;
    mode: DerivedMode;
    offerId: string;
    index: number;
    customerId: string;
    sourcePositionId: string;
    closeFn: () => void;
}

export default function WorkloadItemFormDerivedModal({
    form, mode, offerId, index, customerId, sourcePositionId, closeFn,
}: Props) {
    const { t } = useTranslation();

    const position = useStore(form.store, (s) => s.values.offerPositions[index]);
    const isExtension = mode === "extension";

    const { durations } = useTariffDurationsHook(position.productId, position.contractId);

    // In der Erweiterung bleibt die Laufzeit der Quellposition bindend — sie
    // bestimmt die Spalte in der eingefrorenen Preistabelle.
    const [duration, setDuration] = useState(
        !isExtension && durations.length > 0 && !durations.includes(position.duration)
            ? durations[0]
            : position.duration,
    );
    const [quantity, setQuantity] = useState(position.quantity);
    const [free_months, setFreeMonths] = useState(position.free_months);

    const { totalCents, netCents, unitCents, discountCents, isLoading, unit, total, totalDiscounted } = usePositionPrice({
        source: priceSourceFor(mode),
        query: {
            customerId,
            productId: position.productId,
            contractId: position.contractId,
            duration,
            quantity,
            free_months,
        },
        pin: { customerId, positionId: sourcePositionId },
    });

    const save = () => {
        console.log(totalCents, free_months)

        form.setFieldValue(`offerPositions[${index}]`, {
            ...position,
            duration,
            quantity,
            free_months,
            // total_cents ist brutto, der Wert der Freimonate steht getrennt —
            // so wird die Position auch gespeichert.
            total_cents: totalCents,
            discount_cents: discountCents,
            eur_user_month: unitCents,
        });
        closeFn();
    };

    return (
        <div className="grid flex-wrap items-end gap-4  border-t border-(--border) p-4">
            <div className="flex items-center gap-4">
                {isExtension ? (
                    <Input
                        label={t("renewal.duration")}
                        value={`${position.duration} ${t("renewal.months")}`}
                        disabled
                        readOnly
                    />
                ) : (
                    <Select
                        label={t("renewal.duration")}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        disabled={durations.length === 0}
                    >
                        {durations.length === 0 && (
                            <option value={0}>{t("renewal.no_duration")}</option>
                        )}
                        {durations.map((d) => (
                            <option key={d} value={d}>{d} {t("renewal.months")}</option>
                        ))}
                    </Select>
                )}

                <Input
                    label={t("renewal.quantity")}
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                />

                <Input
                    label={t("renewal.free_months")}
                    type="number"
                    min={0}
                    value={free_months}
                    onChange={(e) => {
                        const num = Number(e.target.value);
                        if (!isNaN(num)) setFreeMonths(Math.max(0, num));
                    }}
                />
            </div>
            <hr className="text-(--border)" />
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-md font-light text-gray-400">{t("renewal.unit_price")}:</span>
                        <p className="text-md font-mono font-normal">
                            {isLoading ? <LoaderCircle size={14} className="animate-spin" /> : formatEur(unit)}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-md font-light text-gray-400">{t("renewal.total")}:</span>
                        <p className="text-md font-mono font-normal">
                            {isLoading ? <LoaderCircle size={14} className="animate-spin" /> : formatEur(totalDiscounted)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="xs" variant="border" onClick={closeFn}>
                        {t("button.cancel")}
                    </Button>
                    <Button size="xs" variant="primary" onClick={save} disabled={isLoading}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>

        </div>
    );
}
