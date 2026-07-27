import { LoaderCircle, Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CreateOfferPositionInput, OrderPosition } from "@keepit/schemas";
import { Badge, Checkbox, Input, Select } from "@/components";
import { useLocale, usePrice, useTariffDurationsHook } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

function eurToCents(eur: number): number { return Math.round(eur * 100); }

export interface RenewalPositionValue extends CreateOfferPositionInput {
    key: string;
}

interface Props {
    customerId: string;
    position: OrderPosition;
    value: RenewalPositionValue;
    onChange: (next: RenewalPositionValue) => void;
}

export default function RenewalPositionRow({ customerId, position, value, onChange }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const { durations } = useTariffDurationsHook(value.productId, value.contractId);

    useEffect(() => {
        if (durations.length > 0 && !durations.includes(value.duration_months)) {
            onChange({ ...value, duration_months: durations[0] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [durations]);

    const priceWorkload: CreateOfferPositionInput = {
        productId: value.productId,
        contractId: value.contractId,
        duration_months: value.duration_months,
        quantity: value.quantity,
        free_months: value.free_months,
        optional: value.optional,
        total_cents: 0,
        eur_user_month: 0,
        discount_cents: 0,
    };

    const { price, isPending: pricePending } = usePrice(customerId, priceWorkload);
    const autoUnitPriceCents = price?.breakdown.unitPrice ?? 0;

    const [editingPrice, setEditingPrice] = useState(false);
    const [overrideEur, setOverrideEur] = useState("");

    const toggleEditPrice = () => {
        if (editingPrice) {
            setEditingPrice(false);
            return;
        }
        setOverrideEur((autoUnitPriceCents / 100).toString());
        setEditingPrice(true);
    };

    const unitPriceCents = editingPrice
        ? (() => {
            const parsed = Number(overrideEur.replace(",", "."));
            return isNaN(parsed) ? 0 : eurToCents(parsed);
        })()
        : autoUnitPriceCents;

    const totalCents = unitPriceCents * value.quantity;
    const displayUnitPrice = editingPrice ? overrideEur : formatEur(unitPriceCents);

    return (
        <div className="grid gap-3 bg-(--subtle-50) border border-(--border) rounded-md p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="grid gap-0.5">
                    <p className="text-md">
                        {localized(position.product.translations, locale, "name")}
                    </p>
                    <div className="flex items-center gap-2">
                        <Badge variant="draft">
                            {localized(position.contract.translations, locale, "name")}
                        </Badge>
                        <span className="text-xs text-(--text-secondary)">
                            {t("renewal.previous_quantity")}: {position.quantity} ·{" "}
                            {t("renewal.duration")}: {position.duration_months} {t("renewal.months")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select
                    label={t("renewal.duration")}
                    value={value.duration_months}
                    onChange={(e) => onChange({ ...value, duration_months: Number(e.target.value) })}
                    disabled={durations.length === 0}
                >
                    {durations.length === 0 && (
                        <option value={0}>{t("renewal.no_duration")}</option>
                    )}
                    {durations.map((duration) => (
                        <option key={duration} value={duration}>
                            {duration} {t("renewal.months")}
                        </option>
                    ))}
                </Select>

                <Input
                    label={t("renewal.quantity")}
                    type="number"
                    min={1}
                    value={value.quantity}
                    onChange={(e) => onChange({ ...value, quantity: Math.max(1, Number(e.target.value)) })}
                />

                <Input
                    label={t("renewal.unit_price")}
                    loading={pricePending}
                    type={editingPrice ? "number" : "text"}
                    step={editingPrice ? "0.01" : undefined}
                    min={editingPrice ? "0" : undefined}
                    value={displayUnitPrice}
                    disabled={!editingPrice}
                    onChange={(e) => setOverrideEur(e.target.value)}
                    rightButton={{
                        icon: <Pen size={12} />,
                        variant: "border",
                        type: "button",
                        onClick: toggleEditPrice,
                    }}
                />

                <Input
                    label={t("renewal.free_months")}
                    type="number"
                    min={0}
                    value={value.free_months}
                    onChange={(e) => {
                        const num = Number(e.target.value);
                        if (!isNaN(num)) onChange({ ...value, free_months: Math.max(0, num) });
                    }}
                />
            </div>

            <div className="flex items-center justify-between">
                <Checkbox
                    label={t("renewal.optional")}
                    checked={value.optional}
                    onChange={() => onChange({ ...value, optional: !value.optional })}
                />

                <div className="flex items-center gap-2">
                    <span className="text-xs text-(--text-secondary)">{t("renewal.total")}:</span>
                    {pricePending ? (
                        <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                        <p className="text-sm font-semibold">{formatEur(totalCents)}</p>
                    )}
                </div>
            </div>
        </div>
    );
}