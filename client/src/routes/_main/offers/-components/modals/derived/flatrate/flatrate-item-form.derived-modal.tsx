import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DerivedFormApi } from "../hook/use-derived-form";
import { Button, Input, Select } from "@/components";
import { useFlatRates, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    form: DerivedFormApi;
    index: number;
    closeFn: () => void;
}

export default function FlatrateItemFormDerivedModal({ form, index, closeFn }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();
    const { flatRates: availableFlatRates } = useFlatRates();

    const flatrate = form.store.state.values.flatrates[index];

    const [flatRateId, setFlatRateId] = useState(flatrate.flatRateId);
    const [quantity, setQuantity] = useState(flatrate.quantity);

    const unitCents = availableFlatRates.find((fr) => fr.id === flatRateId)?.total_cents ?? 0;
    const totalCents = unitCents * quantity;

    const save = () => {
        form.setFieldValue(`flatrates[${index}]`, {
            ...flatrate,
            flatRateId,
            quantity,
            /* total_cents: totalCents,*/
        });
        closeFn();
    };

    return (
        <div>
            <div className="grid flex-wrap items-end gap-4 border-t border-(--border) p-4">
                <div className="flex items-center gap-4">
                    <Select
                        label={t("offerModal.flatrate_section")}
                        value={flatRateId}
                        onChange={(e) => setFlatRateId(e.target.value)}
                        options={availableFlatRates.map((fr) => ({
                            value: fr.id,
                            label: localized(fr.translations, locale, "name"),
                        }))}
                    />

                    <Input
                        label={t("renewal.quantity")}
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    />
                </div>

                <hr className="text-(--border)" />

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-md font-light text-gray-400">{t("renewal.unit_price")}:</span>
                            <p className="text-md font-mono font-normal">{formatEur(unitCents)}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-md font-light text-gray-400">{t("renewal.total")}:</span>
                            <p className="text-md font-mono font-normal">{formatEur(totalCents)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="xs" variant="border" onClick={closeFn}>
                            {t("button.cancel")}
                        </Button>
                        <Button size="xs" variant="primary" onClick={save}>
                            {t("button.save")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}