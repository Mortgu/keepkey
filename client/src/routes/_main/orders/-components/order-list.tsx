import { useTranslation } from "react-i18next";
import OrderCard from "./card/order-card";
import OrderModal from "./order-modal";
import type { Order } from "@keepit/schemas";
import { useModal, useOrders } from "@/hooks";

import type { OrderFilters } from "../-hooks/use-order-filters";

interface Props {
    filters: OrderFilters;
}

export default function OrderList({ filters }: Props) {
    const editModal = useModal();

    const { t } = useTranslation();
    const { orders } = useOrders(filters.params);

    return (
        <>
            <div className='grid gap-2'>
                {orders.map((order: Order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {editModal.isOpen && (
                <OrderModal key={editModal.key} onClose={editModal.close} />
            )}
        </>
    )
}
