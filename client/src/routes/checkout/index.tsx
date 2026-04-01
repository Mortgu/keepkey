import { createFileRoute } from '@tanstack/react-router'
import { Loader, Pen, Trash } from "lucide-react";
import Button from '@/components/button/button';
import { authClient } from '@/lib/auth-client';
import { useShoppingCart } from '@/hooks/shopping-cart';
import { requireSession } from "@/lib/session.ts";
import type { ShoppingCartItem } from '@/data/types';

export const Route = createFileRoute('/checkout/')({
    component: RouteComponent,

    beforeLoad: ({ context }) => requireSession(context),
})

function RouteComponent() {
    const { shoppingCart, handleCheckout, isProcessing, removeFromShoppingCart, error, checkoutData } = useShoppingCart();
    const { data: session } = authClient.useSession();
    const emailVerified = session?.user.emailVerified;

    if (isProcessing) {
        return <Loader className="animate-spin" />
    }

    if (error) {
        return (
            <p>Error: {error.message}</p>
        )
    }


    return (
        <div>
            {error && (
                <p>{error}</p>
            )}

            {!emailVerified && (
                <div>You need to verify your E-Mail to order!</div>
            )}

            {/* Header */}
            <div className='w-full flex items-center justify-between my-4'>
                <h1 className='text-2xl'>Warenkorb</h1>
                <Button disabled={shoppingCart.length === 0} size='sm' onClick={() => {
                    handleCheckout(shoppingCart);
                }}>
                    {isProcessing && <Loader className='size-4 animate-spin' />}
                    {!isProcessing && "Create Order"}
                </Button>
            </div>

            <div className='grid gap-4'>
                {shoppingCart.map((item: ShoppingCartItem, index) => (
                    <div key={index} className='flex items-center justify-between gap-4 border border-gray-200 p-3 rounded-md'>
                        <div>
                            <p className='text-lg'>{item.product.name}</p>
                            <p className='text-gray-500'>{item.contract.name} | {item.duration} Jahr(e)</p>
                        </div>
                        <div>
                            <p>{item.quantity}x</p>
                            <p>{item.price} €</p>
                        </div>
                        <div>
                            <Button variant="ghost" size='sm' className='aspect-square'>
                                <Pen className='size-4' />
                            </Button>

                            <Button onClick={() => removeFromShoppingCart(item.id)} variant="ghost" size='sm' className='aspect-square'>
                                <Trash className='size-4' />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
