import type { Offer } from "@/types";
import { useState } from "react";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";
import useOfferPricing from "../-hooks/use-offer-pricing";

interface Props {
    currentOffer?: Offer;
    customerId: string;
}

export default function useWorkloadOfferModal({ currentOffer, customerId }: Props) {
    const { resolvePrice } = useOfferPricing(customerId);

    const [offerPositions, setOfferPositions] = useState<Array<OfferProductInput>>(
        currentOffer?.offerPositions ?? []);

    const addWorkload = async (workload: OfferProductInput) => {
        const price = await resolvePrice(workload);
        setOfferPositions((prev) => [...prev, price]);
    }

    const updateWorkload = async (index: number, workload: OfferProductInput) => {
        const price = await resolvePrice(workload);
        setOfferPositions((prev) => prev.map((p, i) => (i === index ? price : p)));
    }

    const deleteWorkload = (index: number) => {
        setOfferPositions((prev) => prev.filter((_, i) => i !== index));
    }

    return {
        offerPositions,

        addWorkload,
        updateWorkload,
        deleteWorkload,
    };
}