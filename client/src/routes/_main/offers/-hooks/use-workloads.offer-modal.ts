import { useStore } from "@tanstack/react-form";
import type { OfferFormApi } from "../-hooks/use-offer-form";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import useOfferPricing from "../-hooks/mutations/pricing.mutations";

interface Props {
    customerId: string;
    form: OfferFormApi;
}

export default function useWorkloadOfferModal({ customerId, form }: Props) {
    const { resolvePrice } = useOfferPricing(customerId);

    const offerPositions = useStore(form.store, (s) => s.values.offerPositions);

    const addWorkload = async (workload: CreateOfferPositionInput) => {
        const price = await resolvePrice(workload);
        form.setFieldValue("offerPositions", [...offerPositions, price]);
    }

    const updateWorkload = async (index: number, workload: CreateOfferPositionInput) => {
        const price = await resolvePrice(workload);
        form.setFieldValue("offerPositions", offerPositions.map((p, i) => (i === index ? price : p)));
    }

    const deleteWorkload = (index: number) => {
        form.setFieldValue("offerPositions", offerPositions.filter((_, i) => i !== index));
    }

    return {
        offerPositions,

        addWorkload,
        updateWorkload,
        deleteWorkload,
    };
}