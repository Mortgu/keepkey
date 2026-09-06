import { useState } from "react";
import { useModal } from "@/hooks";

export function useCustomerActions() {
    const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

    const orderModal = useModal();

    const createOrder = (customerId: string) => {
        setActiveCustomerId(customerId);
        orderModal.open();
    };

    return {
        actions: { createOrder },
        activeCustomerId,
        modals: { orderModal },
    };
}
