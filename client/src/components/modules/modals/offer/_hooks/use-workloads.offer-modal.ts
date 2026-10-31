import { useStore } from "@tanstack/react-form";
import {  coordinatesFrom } from "@keepit/schemas";
import type { CreateOfferPositionInput, PriceHeader } from "@keepit/schemas";
import type { OfferModalFormApi } from "./use-offer-modal-form";
import { usePriceResolver } from "@/hooks";

interface Props {
    header: PriceHeader;
    form: OfferModalFormApi;
}

export default function useWorkloadOfferModal({ header, form }: Props) {
    const resolvePrice = usePriceResolver();

    const offerPositions = useStore(form.store, (s) => s.values.offerPositions);

    const priced = async (workload: CreateOfferPositionInput): Promise<CreateOfferPositionInput> => {
        const price = await resolvePrice(coordinatesFrom(header, workload));

        return {
            ...workload,
            totalCents: price.totalCents,
            unitCents: price.unitCents,
            discountCents: price.discountCents,
        };
    };

    const addWorkload = async (workload: CreateOfferPositionInput) => {
        form.setFieldValue("offerPositions", [...offerPositions, await priced(workload)]);
    }

    const updateWorkload = async (index: number, workload: CreateOfferPositionInput) => {
        const next = await priced(workload);

        form.setFieldValue("offerPositions", offerPositions.map((position, i) => (
            // Die Verbindung zur Quellposition überlebt das Bearbeiten — ohne sie
            // wüsste eine Lizenzerweiterung nicht mehr, worauf sie sich bezieht.
            i === index ? { ...position, ...next } : position
        )));
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
