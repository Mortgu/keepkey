import { Button } from "@/components";
import OrderListItems from "./order-list-item";

import { Plus } from "lucide-react";
import { useState } from "react";
import OrderModal from "./order-modal";
import { useOrderHook } from "@/hooks";
import type { Order } from "@/types";

export default function OrderList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    const { orders } = useOrderHook();

    return (
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Bestellungen</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>

                {orders.map((order: Order, index: number) => (
                    <OrderListItems key={order.id} order={order} />
                ))}

            </div>

            <OrderModal open={isOpen} cancelFn={() => setOpen(false)}
                submitFn={() => { }} />

        </div>
    )
}