import { Button } from "@/components";
import { useFlatRates, useLocale } from "@/hooks";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OfferFormApi } from "../../-hooks/use-offer-form";
import useFlatrateOfferModal from "../../-hooks/use-flatreate.offer-modal";
import type { Offer } from "@/types";
import { useState } from "react";
import FlatrateItemOfferModal from "./flatrate-item";
import FlatrateFormOfferModal from "./flatrate-form";

interface Props {
    currentOffer?: Offer;
    form: OfferFormApi;
}

export default function FlatrateOfferModalSection({ currentOffer, form }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();
    const { flatRates } = useFlatRates();
    const {
        flatrates,
        addFlatrate,
        updateFlatrate,
        deleteFlatrate
    } = useFlatrateOfferModal({ currentOffer, form });

    const [showFlatrateForm, setShowFlatrateForm] = useState<boolean>(false);

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>Flatrates</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => setShowFlatrateForm(true)} disabled={false}>
                        <Plus size={14} /> {t("offerModal.add_flatrate")}
                    </Button>

                </div>

            </div>

            {flatrates.length === 0 && !showFlatrateForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch keine Flatrate hinzugefügt
                </p>
            )}

            {showFlatrateForm && (
                <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                    <FlatrateFormOfferModal
                        cancelFn={() => setShowFlatrateForm(false)}
                        saveFn={(v) => addFlatrate(v)}
                    />
                </div>
            )}

            {flatrates.map((flatrate, index) => (
                <FlatrateItemOfferModal
                    flatrate={flatrate}
                    updateFn={(flatrate) => updateFlatrate(index, flatrate)}
                    deleteFn={() => deleteFlatrate(index)}
                />
            ))}
        </div>
    )
}