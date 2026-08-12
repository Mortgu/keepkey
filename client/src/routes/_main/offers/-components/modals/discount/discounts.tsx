import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOfferModalContext } from "../offer-modal-context";
import DiscountForm from "./discount-form";
import DiscountItem from "./discount-item";
import { Button } from "@/components";
import useDiscountsOfferModal from "@/routes/_main/offers/-hooks/use-discounts.offer-modal";

export default function DiscountSection() {
    const { t } = useTranslation();
    const { form, policy } = useOfferModalContext();

    const {
        discounts,
        addDiscount,
        updateDiscount,
        deleteDiscount,
    } = useDiscountsOfferModal({ form });

    const [showForm, setShowForm] = useState<boolean>(false);

    if (policy.discounts.access === "hidden") return null;

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.discount_section")}</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">
                    {policy.discounts.canAdd && (
                        <Button type="button" variant="link" size="fit_sm"
                            onClick={() => setShowForm(true)} disabled={showForm}>
                            <Plus size={14} /> {t("offerModal.add_discount")}
                        </Button>
                    )}
                </div>
            </div>

            {discounts.length === 0 && !showForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch kein Rabatt hinzugefügt
                </p>
            )}

            {discounts.map((discount, index) => (
                <DiscountItem
                    key={`${discount.title}-${index}`}
                    discount={discount}
                    updateFn={(d) => updateDiscount(index, d)}
                    deleteFn={policy.discounts.canRemove ? () => deleteDiscount(index) : undefined}
                />
            ))}

            {showForm && (
                <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                    <DiscountForm
                        saveFn={(d) => addDiscount(d)}
                        cancelFn={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    );
}
