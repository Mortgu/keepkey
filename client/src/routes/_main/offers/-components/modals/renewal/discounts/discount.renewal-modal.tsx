import type { OfferDiscount } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import DiscountItemRenewalModal from "./discount-item.renewal-modal";

interface Props {
    form: RenewalFormApi;
    originalDiscounts: Array<OfferDiscount>;
}

export default function DiscountRenewalModal({ form, originalDiscounts }: Props) {
    const { t } = useTranslation();

    const discounts = useStore(form.store, (s) => s.values.discounts);

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            <div className="flex items-center justify-between">
                <p>{t("offerModal.discount_section")}</p>
            </div>

            {discounts.length === 0 && (
                <div className="flex items-center justify-center w-full">
                    <p className="text-gray-400 font-light">Keine Rabatte vorhanden</p>
                </div>
            )}

            <div className="grid gap-2">
                {discounts.map((discount, index) => (
                    <DiscountItemRenewalModal
                        key={index}
                        form={form}
                        index={index}
                        discount={originalDiscounts[index]}
                    />
                ))}
            </div>
        </div>
    )
}