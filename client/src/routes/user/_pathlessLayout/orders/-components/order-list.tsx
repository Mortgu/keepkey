import Button from "@/components/button/button";
import { useOrders } from "@/hooks/order";
import { Loader, Pen, Plus, Trash } from "lucide-react";
import { formatDate } from "@/lib/format.ts";
import DocumentStatus from "@/components/document-status";

export default function OrderList() {
    const { orders, isPending, error, deleteOrder } = useOrders();

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
                {orders.map((order: any) => (
                    <div className='grid gap-2 border border-gray-200 p-3 rounded-md'>
                        <div className='flex items-center justify-between'>
                            <div className=" flex-1">
                                <p className='text-lg'>{order.user.name} </p>
                                <p className='text-sm text-gray-500'>{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="mr-4">
                                <DocumentStatus orderId={order.id} />
                            </div>
                            <div>
                                <Button size='sm' variant='ghost' className='aspect-square'>
                                    <Pen className='size-4' />
                                </Button>
                                <Button onClick={() => deleteOrder(order.id)} size='sm' variant='ghost' className='aspect-square'>
                                    <Trash className='size-4' />
                                </Button>
                            </div>
                        </div>
                        <div className='flex gap-2 mt-2'>
                            {order.orderPositions.map((position: any) => (
                                <div className='flex items-center justify-between flex-1 gap-2 p-3 border border-gray-200 rounded-md'>
                                    <div className="grid gap-2">
                                        <p className='text-md' key={position.id}>{position.product.name} ({position.quantity}x)
                                        </p>
                                        <p className='text-sm text-gray-500' key={position.id}>{position.contract.name}</p>
                                    </div>
                                    <p>200,00€</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>


        </div>
    )
}