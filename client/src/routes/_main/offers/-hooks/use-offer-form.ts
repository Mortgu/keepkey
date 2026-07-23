import type { Offer } from "@/types";
import { useForm, useStore } from "@tanstack/react-form";
import useOfferModal from "../-hooks/use-offer.offer-modal";
import { useOfferManager } from "@/hooks";
import { useState } from "react";

import { createOfferSchema } from '@keepit/schemas';

interface Props {
    currentOffer?: Offer;
    closeFn: () => void;
}

export default function useOfferForm({ currentOffer, closeFn }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer });
    const { createOffer, updateOffer } = useOfferManager();

    const [expectedVersion] = useState(currentOffer?.version);

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema
        },
        onSubmit: async ({ value }) => {
            if (currentOffer) {
                await updateOffer({
                    offerId: currentOffer.id,
                    expectedVersion: expectedVersion!,
                    payload: value,
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