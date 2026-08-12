import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useOfferModalContext } from "../offer-modal-context";
import FlatrateItem from "./flatrate-item";
import FlatrateForm from "./flatrate-form";
import { Button } from "@/components";
import useFlatrateOfferModal from "@/routes/_main/offers/-hooks/use-flatreate.offer-modal";

export default function FlatrateSection() {
    const { t } = useTranslation();
    const { form, policy } = useOfferModalContext();

    const {
        flatrates,
        addFlatrate,
        updateFlatrate,
        deleteFlatrate
    } = useFlatrateOfferModal({ form });

    const [showFlatrateForm, setShowFlatrateForm] = useState<boolean>(false);

    if (policy.flatrates.access === "hidden") return null;

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.flatrate_section")}</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    {policy.flatrates.canAdd && (
                        <Button type="button" variant="link" size="fit_sm"
                            onClick={() => setShowFlatrateForm(true)} disabled={showFlatrateForm}>
                            <Plus size={14} /> {t("offerModal.add_flatrate")}
                        </Button>
                    )}

                </div>

            </div>

            {flatrates.length === 0 && !showFlatrateForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch keine Flatrate hinzugefügt
                </p>
            )}

            {showFlatrateForm && (
                <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                    <FlatrateForm
                        cancelFn={() => setShowFlatrateForm(false)}
                        saveFn={(v) => addFlatrate(v)}
                    />
                </div>
            )}

            {flatrates.map((flatrate, index) => (
                <FlatrateItem
                    key={`${flatrate.flatRateId}-${index}`}
                    flatrate={flatrate}
                    updateFn={(updatedFr) => updateFlatrate(index, updatedFr)}
                    deleteFn={policy.flatrates.canRemove ? () => deleteFlatrate(index) : undefined}
                />
            ))}
        </div>
    )
}
