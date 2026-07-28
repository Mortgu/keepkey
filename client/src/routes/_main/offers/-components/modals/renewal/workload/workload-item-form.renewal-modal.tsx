import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { Button, Input, Select } from "@/components";
import { usePrice, useTariffDurationsHook } from "@/hooks";
import { formatEur } from "@/utils/utils";

interface Props {
    form: RenewalFormApi;
    index: number;
    customerId: string;
    closeFn: () => void;
}

export default function WorkloadItemFormRenwalModal({ form, index, customerId, closeFn }: Props) {
    const { t } = useTranslation();

    const position = form.store.state.values.positions[index];

    const { durations } = useTariffDurationsHook(position.productId, position.contractId);

    const [duration, setDuration] = useState(
        durations.length > 0 && !durations.includes(position.duration_months)
            ? durations[0]
            : position.duration_months,
    );
    const [quantity, setQuantity] = useState(position.quantity);
    const [freeMonths, setFreeMonths] = useState(position.free_months);

    const priceWorkload: CreateOfferPositionInput = {
        productId: position.productId,
        contractId: position.contractId,
        duration_months: duration,
        quantity,
        free_months: freeMonths,
        optional: position.optional,
        total_cents: 0,
        eur_user_month: 0,
        discount_cents: 0,
    };

    const { price, isPending: pricePending } = usePrice(customerId, priceWorkload);
    const totalCents = price?.price ?? 0;
    const unitCents = price?.breakdown.unitPrice ?? 0;

    const save = () => {
        form.setFieldValue(`positions[${index}]`, {
            ...position,
            duration_months: duration,
            quantity,
            free_months: freeMonths,
            total_cents: totalCents,
        });
        closeFn();
    };

    return (
        <div>
            <div className="grid flex-wrap items-end gap-4 bg-(--subtle-50) border-t border-(--border) p-4">
                <div className="flex items-center gap-4">
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
                        value={freeMonths}
                        onChange={(e) => {
                            const num = Number(e.target.value);
                            if (!isNaN(num)) setFreeMonths(Math.max(0, num));
                        }}
                    />
                </div>
                <hr className="text-(--border)" />
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{t("renewal.unit_price")}</span>
                        <p className="text-md font-mono font-normal pt-1.5">
                            {pricePending ? <LoaderCircle size={14} className="animate-spin" /> : formatEur(unitCents)}
                        </p>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{t("renewal.total")}</span>
                        <p className="text-md font-mono font-normal pt-1.5">
                            {pricePending ? <LoaderCircle size={14} className="animate-spin" /> : formatEur(totalCents)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-(--border) p-2">
                <div></div>
                <div className="flex items-center gap-2">
                    <Button size="xs" variant="secondary" onClick={closeFn}>
                        {t("button.cancel")}
                    </Button>
                    <Button size="xs" variant="primary" onClick={save}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div>
    );
}