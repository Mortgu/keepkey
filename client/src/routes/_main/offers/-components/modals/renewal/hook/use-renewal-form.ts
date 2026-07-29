import { useForm } from "@tanstack/react-form";
import {  createOfferSchema } from "@keepit/schemas";
import type {Offer} from "@keepit/schemas";
import { useRenewOffer } from "@/hooks";
import useOfferModal from "@/routes/_main/offers/-hooks/use-offer.offer-modal";

interface Props {
    offer: Offer;
    closeFn: () => void;
}

export default function useRenewalForm({ offer, closeFn }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer: offer });
    const { renewOffer } = useRenewOffer();

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema,
        },
        onSubmit: async ({ value }) => {
            await renewOffer({ offerId: offer.id, input: value });
            closeFn();
        },
    });

    return { form };
}

export type RenewalFormApi = ReturnType<typeof useRenewalForm>["form"];
