import { useForm } from "@tanstack/react-form";
import { createOfferSchema, type Offer } from "@keepit/schemas";
import { useCreateOffer } from "@/hooks";
import useOfferModal from "@/routes/_main/offers/-hooks/use-offer.offer-modal";

interface Props {
    offer: Offer;
    closeFn: () => void;
}

export default function useRenewalForm({ offer, closeFn }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer: offer });
    const { createOffer } = useCreateOffer();

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema,
        },
        onSubmit: async ({ value }) => {
            await createOffer(value);
            closeFn();
        },
    });

    return { form };
}

export type RenewalFormApi = ReturnType<typeof useRenewalForm>["form"];