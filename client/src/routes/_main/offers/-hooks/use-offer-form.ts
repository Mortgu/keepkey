import type { Offer } from "@/types";
import { useForm, useStore } from "@tanstack/react-form";
import useOfferModal from "../-hooks2/use-offer.offer-modal";
import { offerFormSchema } from "../-schemas/offer-form-schema";

interface Props {
    currentOffer?: Offer;
}

export default function useOfferForm({ currentOffer }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer });

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: offerFormSchema,
            onChange: offerFormSchema
        },
        onSubmit: async ({ value }) => {
            console.log(value);
        },
    });

    const customerId = useStore(form.store, (s) => s.values.customerId);

    return {
        form,

        customerId
    }
}

export type OfferFormApi = ReturnType<typeof useOfferForm>["form"];