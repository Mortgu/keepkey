import Button from "@/components/button/button";
import { useOrders } from "@/hooks/order";
import { Loader, Plus } from "lucide-react";

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

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Orders ({orders.length})</h1>
                <Button size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {orders.map(order => (
                    <>{JSON.stringify(order)}</>
                ))}
            </div>


        </div>
    )
}