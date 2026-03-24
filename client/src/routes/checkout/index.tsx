import {createFileRoute} from '@tanstack/react-router'
import { Loader } from "lucide-react";
import Button from '@/components/button/button';
import { authClient } from '@/lib/auth-client';
import { useShoppingCart } from '@/hooks/shopping-cart';
import {formatCurrency} from "@/lib/format.ts";
import {requireSession} from "@/lib/session.ts";

export const Route = createFileRoute('/checkout/')({
    component: RouteComponent,

    beforeLoad: ({ context }) => requireSession(context),
})

function RouteComponent() {
    const { shoppingCart, checkout, isProcessing, error } = useShoppingCart();
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
                <div>Please verify your e-mail</div>
            )}

            {/* Header */}
            <div className='w-full flex items-center justify-between my-4'>
                <h1 className='text-2xl'>Warenkorb</h1>
                <Button disabled={shoppingCart.length === 0} size='sm' onClick={() => {
                    checkout(shoppingCart);
                }}>
                    {isProcessing && <Loader className='size-4 animate-spin' />}
                    {!isProcessing && "Create Order"}
                </Button>
            </div>

            <div className='grid gap-4'>
                {shoppingCart.map((item: any) =>  {

                    // TODO: Berechnung Falsch! Neuer Preis wird für alle Seats gesetzt
                    const price = item.product.productPricing.filter(i => {
                        return i.min_quantity <= item.quantity && (i.max_quantity >= item.quantity || i.max_quantity === 0);
                    })


                    return (
                        <div key={item.id} className='flex items-center justify-between gap-4 border border-gray-200 p-3 rounded-md'>
                            <div>
                                <p className='text-lg'>{item.product.name}</p>
                                <p className='text-gray-500'>{item.contract.name} | {item.duration} Jahr(e)</p>
                            </div>
                            <div>
                                <p>{item.quantity}x</p>
                                <p>{price.length > 0 ? formatCurrency(price[0].price * item.quantity) : 'Kein Preis vorhanden!'}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

        </div >
    )
}
