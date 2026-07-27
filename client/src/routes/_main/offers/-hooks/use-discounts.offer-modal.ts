import { useStore } from "@tanstack/react-form";
import type { CreateOfferDiscountInput } from "@keepit/schemas";
import type { OfferFormApi } from "../-hooks/use-offer-form";

interface Props {
    form: OfferFormApi;
}

export default function useDiscountsOfferModal({ form }: Props) {
    const discounts = useStore(form.store, (s) => s.values.discounts);

    const addDiscount = (discount: CreateOfferDiscountInput) => {
        form.setFieldValue("discounts", [...discounts, discount]);
    };

    const updateDiscount = (index: number, discount: CreateOfferDiscountInput) => {
        form.setFieldValue("discounts", discounts.map((d, i) => (i === index ? discount : d)));
    };

    const deleteDiscount = (index: number) => {
        form.setFieldValue("discounts", discounts.filter((_, i) => i !== index));
    };

    return {
        discounts,
        addDiscount,
        updateDiscount,
        deleteDiscount,
    };
}
