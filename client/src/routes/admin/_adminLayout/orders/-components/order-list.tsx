import Button from "@/components/button/button";
import OrderListItems from "./order-list-items";

import { Plus } from "lucide-react";
import { useState } from "react";
import OrderModal from "./order-modal";

export default function OrderList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    return (
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Bestellungen</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                <OrderListItems />
            </div>

            <OrderModal isOpen={isOpen} onClose={() => setOpen(false)}
                onSubmit={() => { }} />

        </div>
    )
}