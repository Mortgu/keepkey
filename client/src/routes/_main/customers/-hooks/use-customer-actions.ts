import { useState } from "react";
import { useModal } from "@/hooks";

export function useCustomerActions() {
    const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

    const offerModal = useModal();
    const orderModal = useModal();

    const createOffer = (customerId: string) => {
        setActiveCustomerId(customerId);
        offerModal.open();
    };

    const createOrder = (customerId: string) => {
        setActiveCustomerId(customerId);
        orderModal.open();
    };

    return {
        actions: { createOffer, createOrder },
        activeCustomerId,
        modals: { offerModal, orderModal },
    };
}
