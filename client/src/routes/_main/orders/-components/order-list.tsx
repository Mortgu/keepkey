import OrderCard from "./card/order-card";
import type { OrderFilters } from "../-hooks/use-order-filters";
import { useOrders } from "@/hooks";

interface Props {
    filters: OrderFilters;
}

export default function OrderList({ filters }: Props) {
    const { orders } = useOrders(filters.params);

    return (
        <div className="grid gap-2">
            {orders.map(order => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
}
