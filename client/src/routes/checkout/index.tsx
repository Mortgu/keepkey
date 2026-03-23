import { createFileRoute } from '@tanstack/react-router'
import { Loader } from "lucide-react";
import Button from '@/components/button/button';
import { authClient } from '@/lib/auth-client';
import { useShoppingCart } from '@/hooks/shopping-cart';

export const Route = createFileRoute('/checkout/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { shoppingCart, checkout, isProcessing } = useShoppingCart();

    const { data: session, isPending, error } = authClient.useSession();

    if (isPending) {
        return <Loader className="animate-spin" />
    }

    if (error) {
        return (
            <p>Error: {error.message}</p>
        )
    }

    if (!session || !session.user) {
        return (
            <p>Not autherized</p>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className='w-full flex items-center justify-between my-4'>
                <h1 className='text-2xl'>Warenkorp</h1>
                <Button size='sm' onClick={() => {
                    checkout(shoppingCart);
                }}>
                    {isProcessing && <Loader className='size-4 animate-spin' />}
                    {!isProcessing && "Create Order"}
                </Button>
            </div>

            {shoppingCart.map((item: any) => (
                <div key={item.id}>
                    <p>{item.product.name}</p>
                    <div>
                        <p>{item.quantity}x</p>
                        <p>{item.product.price}</p>
                    </div>
                </div>
            ))}

        </div >
    )
}
