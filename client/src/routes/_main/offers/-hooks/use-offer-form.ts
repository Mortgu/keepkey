import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import {

    createOfferSchema
} from '@keepit/schemas';
import useOfferModal from "../-hooks/use-offer.offer-modal";
import type { Offer } from '@keepit/schemas';
import { useOfferManager } from "@/hooks";


interface Props {
    currentOffer?: Offer;
    closeFn: () => void;
    preselectedCustomerId?: string;
}

export default function useOfferForm({ currentOffer, closeFn, preselectedCustomerId }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer, preselectedCustomerId });
    const { createOffer, updateOffer } = useOfferManager();

    const [expectedVersion] = useState(currentOffer?.version);

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            if (currentOffer) {
                await updateOffer({
                    offerId: currentOffer.id,
                    input: { ...value, expectedVersion: expectedVersion! },
                });
            } else {
                await createOffer(value);
            }

            closeFn();
        },
    });

    const customerId = useStore(form.store, (s) => s.values.customerId);

    return {
        form,
        customerId
    }
}

export type OfferFormApi = ReturnType<typeof useOfferForm>["form"];