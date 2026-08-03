import OrderCard from "../../../orders/-components/card/order-card";
import { RouteError, Skeleton } from "@/components";
import { useOrders } from "@/hooks";

interface Props {
    customerId: string;
}

export default function CustomerOrdersTab({ customerId }: Props) {
    const { orders, isPending, error } = useOrders({ companyIds: [customerId] });

    if (error) return <RouteError error={error} />;
    if (isPending) {
        return (
            <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-(--border) rounded-md p-4">
                        <Skeleton shape="rect" className="h-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return <p className="text-sm text-(--text-secondary) py-4">Keine Bestellungen.</p>;
    }

    return (
        <div className="grid gap-2">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    );
}
