import { useState } from "react";
import type { OfferFlatrateInput } from "./flatrate-form";
import { useFlatRates, useLocale } from "@/hooks";
import { Button } from "@/components";
import { localized } from "@/lib/i18n-content";
import { X, Pen, Trash } from "lucide-react";
import FlatrateFormOfferModal from "./flatrate-form";

interface Props {
    flatrate: OfferFlatrateInput;

    updateFn: (flatrate: OfferFlatrateInput) => void;
    deleteFn: () => void;
}

export default function FlatrateItemOfferModal({ flatrate, updateFn, deleteFn }: Props) {
    const locale = useLocale();

    const { flatRates } = useFlatRates();
    const fetchedFlatrate = flatRates.find(fr => fr.id === flatrate.flatRateId);

    const [isEdit, setEdit] = useState<boolean>(false);

    return (
        <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 gap-4">

                <div className="grid gap-0.5">
                    <p className="flex items-center gap-1 text-sm">
                        {flatrate.quantity} <X size={14} /> {localized(fetchedFlatrate?.translations, locale, "name")}
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    {/* actions */}
                    <div className="flex items-center gap-2">

                        <Button variant="border" type="button" size="sm" disabled={isEdit} icon={
                            <Pen size={14} />
                        } iconOnly onClick={() => setEdit(true)} />

                        <Button variant="border" type="button" size="sm" icon={
                            <Trash size={14} />
                        } iconOnly onClick={deleteFn} />

                    </div>
                </div>


            </div>

            {isEdit && (
                <hr className="text-(--border)" />
            )}

            {isEdit && (
                <FlatrateFormOfferModal
                    currentFlatrate={flatrate}
                    cancelFn={() => setEdit(false)}
                    saveFn={(v) => updateFn(v)}
                />
            )}
        </div>
    )
}