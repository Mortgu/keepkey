import { useStore } from "@tanstack/react-form";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import type { OfferFormApi } from "../-hooks/use-offer-form";
import { usePriceResolver } from "@/hooks";

interface Props {
    customerId: string;
    form: OfferFormApi;
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
        const price = await resolvePrice({ customerId, ...workload });

        return {
            ...workload,
            total_cents: price.total,
            eur_user_month: price.unit,
            discount_cents: price.discount,
        };
    };

    const addWorkload = async (workload: CreateOfferPositionInput) => {
        form.setFieldValue("offerPositions", [...offerPositions, await priced(workload)]);
    }

    const updateWorkload = async (index: number, workload: CreateOfferPositionInput) => {
        const next = await priced(workload);
        form.setFieldValue("offerPositions", offerPositions.map((p, i) => (i === index ? next : p)));
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
