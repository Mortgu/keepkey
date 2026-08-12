import { useStore } from "@tanstack/react-form";
import {  coordinatesFrom } from "@keepit/schemas";
import type {CreateOfferPositionInput} from "@keepit/schemas";
import type { OfferModalFormApi } from "./use-offer-modal-form";
import { usePriceResolver } from "@/hooks";

interface Props {
    customerId: string;
    form: OfferModalFormApi;
}

export default function useWorkloadOfferModal({ customerId, form }: Props) {
    const resolvePrice = usePriceResolver();

    const offerPositions = useStore(form.store, (s) => s.values.offerPositions);

    /**
     * Ergänzt eine Position um den aktuellen Preis, bevor sie ins Formular geht.
     * Der Server rechnet beim Speichern ohnehin neu — hier geht es um die
     * Anzeige der Summen im Modal.
     */
    const priced = async (workload: CreateOfferPositionInput): Promise<CreateOfferPositionInput> => {
        const price = await resolvePrice(coordinatesFrom(customerId, workload));

        return {
            ...workload,
            total_cents: price.total_cents,
            eur_user_month: price.eur_user_month,
            discount_cents: price.discount_cents,
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
