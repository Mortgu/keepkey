import { Button, Checkbox, Input, Select } from "@/components";
import { useContracts, useLocale, useProducts, useTariffDurationsHook } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { Pen } from "lucide-react";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import type { CreateOfferPositionInput } from "@keepit/schemas";

interface Props {
    currentWorkload?: CreateOfferPositionInput;
    cancelFn: () => void;
    saveFn: (values: CreateOfferPositionInput) => void;
}

export default function WorkloadFormOfferModal({ currentWorkload, cancelFn, saveFn }: Props) {
    const locale = useLocale();
    const { t } = useTranslation();
    const { products } = useProducts();
    const { contracts } = useContracts();

    const [workload, setWorkload] = useState<string>(currentWorkload?.productId || products[0].id || "");
    const [contract, setContract] = useState<string>(currentWorkload?.contractId || contracts[0].id || "");

    const { durations } = useTariffDurationsHook(workload, contract);

    const [duration, setDuration] = useState<number>(currentWorkload?.duration_months || durations[0]);

    const [quantity, setQuantity] = useState<number>(currentWorkload?.quantity || 0);

    const [freeMonths, setFreeMonths] = useState<number>(currentWorkload?.free_months || 0);

    const [optional, setOptional] = useState<boolean>(currentWorkload?.optional || false);

    const [overrideUnitPrice, setOverrideUnitPrice] = useState<boolean>(false);

    useEffect(() => {
        setDuration(durations[0]);
    }, [durations]);

    const handleSave = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();

        saveFn({
            productId: workload,
            contractId: contract,
            duration_months: duration,
            quantity: quantity,
            optional: optional,
            eur_user_month: 0,
            total_cents: 0,
            discount_cents: 0,
            free_months: freeMonths
        });

        cancelFn()
    }

    return (
        <div className="w-full grid gap-3 p-4">
            <div className="flex items-end gap-3">

                {/* Workloads */}
                <Select label="Workload" value={workload} onChange={(e) => setWorkload(e.target.value)}>
                    {products.map(product => (
                        <option key={product.id} value={product.id}>
                            {localized(product.translations, locale, "name")}
                        </option>
                    ))}
                </Select>

                {/* Contracts */}
                <Select label="Contract" value={contract} onChange={(e) => setContract(e.target.value)}>
                    {contracts.map(contract => (
                        <option key={contract.id} value={contract.id}>
                            {localized(contract.translations, locale, "name")}
                        </option>
                    ))}
                </Select>

                {/* Runtime */}
                <Select label="Runtime" value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={durations.length === 0}>
                    {durations.length === 0 && (
                        <option value={0}>Keine Laufzeit definiert!</option>
                    )}

                    {durations.map(duration => (
                        <option key={duration} value={duration}>{duration} {t("common.months")}</option>
                    ))}
                </Select>

                {/* Quantity */}
                <Input type="text" label={t("offerModal.quantity")} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />

            </div>

            <div className="flex items-end gap-3">
                <Input
                    label={t("offerModal.unit_price")}
                    rightButton={{
                        icon: <Pen size={12} />,
                        variant: "border",
                        onClick: () => setOverrideUnitPrice(true)
                    }}
                    value={currentWorkload?.eur_user_month || 0}
                    disabled={!overrideUnitPrice}
                    onBlur={() => setOverrideUnitPrice(!overrideUnitPrice)}
                />

                <Input label={t("offerModal.free_months")} value={freeMonths} onChange={(e) => {
                    const value = Number(e.target.value);
                    if (isNaN(value)) return;
                    setFreeMonths(value);
                }} />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-(--border) pt-4">
                {/* left */}
                <div className="flex items-center gap-4">
                    <Checkbox label="Optional?" checked={optional}
                        onChange={() => setOptional(!optional)} />
                </div>

                {/* right */}
                <div className="flex items-center gap-4">
                    <Button type="button" variant="border" size="sm" onClick={cancelFn}>
                        {t("button.cancel")}
                    </Button>

                    <Button type="button" variant="primary" size="sm" onClick={handleSave}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div >
    )
}