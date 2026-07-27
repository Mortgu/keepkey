import { useStore } from "@tanstack/react-form";
import type { OfferFormApi } from "../-hooks/use-offer-form";
import type { CreateOfferFlatrateInput } from "@keepit/schemas";

interface Props {
    form: OfferFormApi;
}

export default function useFlatrateOfferModal({ form }: Props) {
    const flatrates = useStore(form.store, (s) => s.values.flatrates);

    const addFlatrate = (flatrate: CreateOfferFlatrateInput) => {
        form.setFieldValue("flatrates", [...flatrates, {
            flatRateId: flatrate.flatRateId,
            quantity: flatrate.quantity
        }]);
    }

    const updateFlatrate = (index: number, flatrate: CreateOfferFlatrateInput) => {
        form.setFieldValue("flatrates", flatrates.map((p, i) => (i === index ? flatrate : p)));
    }

    const deleteFlatrate = (index: number) => {
        form.setFieldValue("flatrates", flatrates.filter((_, i) => i !== index));
    }

    return {
        flatrates,

        addFlatrate,
        updateFlatrate,
        deleteFlatrate,
    }
}