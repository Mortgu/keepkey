import { Button } from "@/components";
import type { OfferFormApi } from "../../../-hooks/use-offer-form";
import useDiscountsOfferModal from "../../../-hooks/use-discounts.offer-modal";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DiscountFormOfferModal from "./discount-form";
import DiscountItemOfferModal from "./discount-item";

interface Props {
    form: OfferFormApi;
}

export default function DiscountOfferModalSection({ form }: Props) {
    const { t } = useTranslation();

    const {
        discounts,
        addDiscount,
        updateDiscount,
        deleteDiscount,
    } = useDiscountsOfferModal({ form });

    const [showForm, setShowForm] = useState<boolean>(false);

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.discound_section")}</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">
                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => setShowForm(true)} disabled={showForm}>
                        <Plus size={14} /> {t("offerModal.add_discount")}
                    </Button>
                </div>
            </div>

            {discounts.length === 0 && !showForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch kein Rabatt hinzugefügt
                </p>
            )}

            {discounts.map((discount, index) => (
                <DiscountItemOfferModal
                    key={index}
                    discount={discount}
                    updateFn={(d) => updateDiscount(index, d)}
                    deleteFn={() => deleteDiscount(index)}
                />
            ))}

            {showForm && (
                <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                    <DiscountFormOfferModal
                        saveFn={(d) => addDiscount(d)}
                        cancelFn={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    );
}
