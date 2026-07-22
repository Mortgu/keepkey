import type { Offer } from "@/types";
import { useStore } from "@tanstack/react-form";
import type { OfferFormApi } from "../-hooks/use-offer-form";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";
import useOfferPricing from "../-hooks/mutations/pricing.mutations";

interface Props {
    currentOffer?: Offer;
    customerId: string;
    form: OfferFormApi;
}

export default function useWorkloadOfferModal({ currentOffer, customerId, form }: Props) {
    const { resolvePrice } = useOfferPricing(customerId);

    const offerPositions = useStore(form.store, (s) => s.values.offerPositions);

    const addWorkload = async (workload: OfferProductInput) => {
        const price = await resolvePrice(workload);
        form.setFieldValue("offerPositions", [...offerPositions, price]);
    }

    const updateWorkload = async (index: number, workload: OfferProductInput) => {
        console.log("updateWorkload:", index, workload);
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