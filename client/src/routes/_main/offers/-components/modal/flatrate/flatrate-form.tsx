import { Button, Input, Select } from "@/components";
import { useFlatRates, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { CreateOfferFlatrateInput } from "@keepit/schemas";
import { useState, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    currentFlatrate?: CreateOfferFlatrateInput;
    cancelFn: () => void;
    saveFn: (values: CreateOfferFlatrateInput) => void;
}

export default function FlatrateFormOfferModal({ currentFlatrate, cancelFn, saveFn }: Props) {
    const locale = useLocale();
    const { t } = useTranslation();

    const { flatRates } = useFlatRates();

    const [flatrate, setFlatrate] = useState<string>(currentFlatrate?.flatRateId || flatRates[0]?.id || "");
    const [quantity, setQuantity] = useState<number>(currentFlatrate?.quantity || 1);

    const handleSave = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();

        saveFn({ flatRateId: flatrate, quantity: quantity });

        cancelFn();
    }

    return (
        <div className="w-full grid gap-3 p-4">
            <div className="flex items-end gap-3">

                <Select label={t("offerModal.flatrate")} value={flatrate}
                    onChange={(e) => setFlatrate(e.target.value)}>
                    {flatRates.map(flatrate => (
                        <option key={flatrate.id} value={flatrate.id}>
                            {localized(flatrate.translations, locale, "name")}
                        </option>
                    ))}
                </Select>

                <Input label={t("offerModal.quantity")} type="number" value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />

            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-(--border) pt-4">
                {/* left */}
                <div className="flex items-center gap-4">

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
        </div>
    )
}