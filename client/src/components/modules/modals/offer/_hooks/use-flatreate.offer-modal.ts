import { useStore } from "@tanstack/react-form";
import type { OfferModalFormApi } from "./use-offer-modal-form";
import type { CreateOfferFlatrateInput } from "@keepit/schemas";

interface Props {
    form: OfferModalFormApi;
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