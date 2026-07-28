import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import DiscountItemRenewalModal from "./discount-item.renewal-modal";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import type { OfferDiscount } from "@keepit/schemas";

export interface DiscountItemState {
    title: string;
    description?: string;
    amount_cents: number;
    deleted: boolean;
}

interface Props {
    form: RenewalFormApi;
    originalDiscounts: Array<OfferDiscount>;
}

export default function DiscountRenewalModal({ form, originalDiscounts }: Props) {
    const { t } = useTranslation();

    const [items, setItems] = useState<Array<DiscountItemState>>(
        originalDiscounts.map((d) => ({
            title: d.title,
            description: d.description ?? undefined,
            amount_cents: d.amount_cents,
            deleted: false,
        })),
    );

    useEffect(() => {
        form.setFieldValue(
            "discounts",
            items
                .filter((item) => !item.deleted)
                .map(({ title, description, amount_cents }) => ({
                    title,
                    description,
                    amount_cents,
                })),
        );
    }, [items, form]);

    const updateItem = (index: number, updated: { title: string; description?: string; amount_cents: number }) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updated } : item)));
    };

    const toggleDelete = (index: number) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, deleted: !item.deleted } : item)));
    };

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            <div className="flex items-center justify-between">
                <p>{t("offerModal.discount_section")}</p>
            </div>

            {originalDiscounts.length === 0 && (
                <div className="flex items-center justify-center w-full">
                    <p className="text-gray-400 font-light">Keine Rabatte vorhanden</p>
                </div>
            )}

            <div className="grid gap-2">
                {originalDiscounts.map((originalDiscount, index) => (
                    <DiscountItemRenewalModal
                        key={index}
                        index={index}
                        originalDiscount={originalDiscount}
                        item={items[index]}
                        onUpdate={updateItem}
                        onToggleDelete={toggleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
