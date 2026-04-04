import Button from "@/components/button/button";
import { useOrders } from "@/hooks/order";
import { Loader, Pen, Plus, Trash, File, RotateCcw, Download } from "lucide-react";
import { formatDate } from "@/lib/format.ts";

export default function OrderList() {
    const { orders, isPending, error, deleteOrder, isDeleting } = useOrders({
        adminMode: true
    });

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
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Orders
                    ({orders.length})</h1>
                <Button size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {orders.map((order: any, index: number) => (
                    <div key={index} className='grid gap-2 border border-gray-200 p-3 rounded-md'>
                        <div className='flex items-center justify-between'>
                            <div className="flex-1">
                                <p className='text-lg'>{order.user.name} </p>
                                <p className='text-sm text-gray-500'>{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex items-center">
                                <Button loading={isDeleting} onClick={() => deleteOrder(order.id)} size='sm' variant='ghost' iconOnly icon={
                                    <Trash className='size-4' />
                                } />
                            </div>
                        </div>
                        <div className='flex gap-2 mt-2'>
                            <div className="flex items-center justify-center gap-0 bg-gray-100 rounded-xl px-1 py-0.5">
                                <Button icon={<Download className="size-4" />} variant="primary" size="sm">Rechnung</Button>
                                <Button icon={<RotateCcw className="size-4" />} iconOnly variant="link" size='sm' />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    )
}