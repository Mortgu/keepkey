import Button from "@/components/button/button";
import { useOrders } from "@/hooks/order";
import { Loader, Pen, Plus, Trash } from "lucide-react";
import { formatDate } from "@/lib/format.ts";
import OrderModal from "./order-modal";
import React, { useState } from "react";
import type { Order, OrderPositionItem } from "@/data/types";

export default function OrderListItems() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const { orders, isPending, error, deleteOrder, isDeleting, isGenerating } = useOrders();

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

    return orders.map((order: Order, index: number) => (
        <React.Fragment key={index}>
            <div className='grid border border-(--border) rounded-md'>
                <div className='flex items-center justify-between border-b border-(--border) px-3 py-2'>
                    <div className="flex-1">
                        <p className='text-lg'>{order.employee.name} </p>
                        <p className='text-sm text-gray-500'>{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center">
                        <Button onClick={() => setOpen(true)} size='sm' variant='ghost' iconOnly icon={
                            <Pen className='size-4' />
                        } />

                        <Button loading={isDeleting} onClick={() => deleteOrder(order.id)} size='sm' variant='ghost' iconOnly icon={
                            <Trash className='size-4' />
                        } />
                    </div>
                </div>
                {/* Products */}
                <div className="">
                    {order.orderPositions.map((position: OrderPositionItem) => (
                        <div className="flex items-center justify-between border-b border-(--border) px-3 py-2 ">
                            <div className="flex items-center gap-2">
                                <p>{position.product.name}</p>
                                <p className="text-gray-500">({position.contract.name} / {position.duration} Jahr(e))</p>
                            </div>
                            <p>{position.priceAtPurchase.toFixed(2)} €</p>
                        </div>
                    ))}
                </div>

                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} loading={isGenerating}>
                            Angebot erstellen
                        </Button>
                        <Button variant="secondary" size="sm" icon={<Plus className="size-4" />}>Rechnung erstellen</Button>
                    </div>
                </div>

            </div>

            <OrderModal open={isOpen} cancelFn={() => setOpen(false)}
                submitFn={() => { }} currentOrder={order} />
        </React.Fragment>
    ))
}