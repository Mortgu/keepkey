import type { Offer } from "@/types";
import { useStore } from "@tanstack/react-form";

interface Props {
    currentOffer?: Offer;
}

export default function useFlatrateOfferModal({ currentOffer, form }: Props) {
    const flatrates = useStore(form.store, (s) => s.values.flatrates);


}