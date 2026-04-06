import { useOrders } from "@/hooks/order";
import { Loader } from "lucide-react";
import type { Order } from "@/data/types";
import OrderListItem from "./order-list-item";

function getTotalRevenue(orders: Order[]): number {
    return orders.reduce((orderSum, order) => {
        const orderTotal = order.orderPositions.reduce((posSum, item) => {
            return posSum + item.priceAtPurchase;
        }, 0);

        return orderSum + orderTotal;
    }, 0);
}

export default function OrderList() {
    const { orders, isPending, error } = useOrders();

    if (isPending) {
        return (
            <Loader className='animate-spin' />
        )
    }

    if (error) {
        return (
            <div className='p-2 bg-red-200 border border-red-400 rounded-lg'>
                <p className="text-lg">Error</p>
                <p>{error.message}</p>
            </div>
        )
    }

    const total = getTotalRevenue(orders).toFixed(2);

    return (
        <div>

            {/* Order list header */}
            <div className="flex items-center justify-between mb-6">
                <div className="grid gap-1">
                    <h1 className="text-2xl font-medium">Orders</h1>
                    <p className="text-sm text-gray-500">{orders.length} Orders - {total} €</p>
                </div>

                {/* Header actions */}
                {/*  <Button size="sm">Create <Plus className="size-4" /></Button> */}
            </div>

            {/* Order list item */}
            <div className="grid gap-0">
                {orders.map((order: Order, index: number) => (
                    <OrderListItem key={index} order={order} />
                ))}
            </div>

        </div >
    )
}