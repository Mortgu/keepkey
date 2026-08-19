import { useOrders } from "@/hooks";
import type { OrderFilters } from "../-hooks/use-order-filters";
import OrderCard from "./order-card";

interface Props {
    filters: OrderFilters;
}

export default function OrderList({ filters }: Props) {
    const { orders } = useOrders();

    return (
        <div className="grid gap-2">
            {orders.map(order => (
                <OrderCard order={order} />
            ))}
        </div>
    )
}
