import { createFileRoute } from '@tanstack/react-router'
import { File, Loader, Pen, Trash } from "lucide-react";
import Button from '@/components/button/button';
import { authClient } from '@/lib/auth-client';
import { useShoppingCart } from '@/hooks/shopping-cart';
import { requireSession } from "@/lib/session.ts";
import type { ShoppingCartItem } from '@/data/types';

export const Route = createFileRoute('/_main/checkout/')({
    component: RouteComponent,

    beforeLoad: ({ context }) => requireSession(context),
})

function RouteComponent() {
    const { shoppingCart, isPending, handleCheckout, isProcessing, removeFromShoppingCart, error, checkoutErrors } = useShoppingCart();
    const { data: session } = authClient.useSession();
    const emailVerified = session?.user.emailVerified;

    if (isPending || isProcessing) {
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

            {checkoutErrors && (
                <p>{checkoutErrors.message}</p>
            )}

            {!emailVerified && (
                <div>You need to verify your E-Mail to order!</div>
            )}

            {/* Header */}
            <div className='w-full flex items-center justify-between my-4'>
                <h1 className='text-2xl'>Warenkorb</h1>
                <div className='flex items-center gap-4'>
                    {/*<Button variant="secondary" size='sm' icon={<File className='size-4' />}>Angebot</Button>*/}
                    <Button loading={isProcessing} disabled={shoppingCart?.products.length === 0} size='sm' onClick={() => {
                        handleCheckout();
                    }}>
                        Kostenpflichtig bestellen
                    </Button>
                </div>

            </div>

            <div className='flex items-start gap-4'>
                {/* Produkte als liste */}
                <div className='flex-3 grid gap-4'>
                    {shoppingCart?.products.map((item: ShoppingCartItem, index) => (
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

                    {shoppingCart?.products.length === 0 && (
                        <div className='flex items-center justify-between gap-4 border border-dashed border-gray-400 p-3 rounded-md'>
                            <div>
                                <p className='text-md text-gray-600'>Füge Produkte deinem Wahrenkorb hinzu</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Einstellungen */}
                <div className='flex-1 border border-gray-300  rounded-md'>
                    {/* Gesamtsumme */}
                    <div className='flex items-center justify-between border-b border-gray-200 py-4 mx-4'>
                        <p className='font-bold'>Gesamt:</p>
                        <p>{shoppingCart?.total} €</p>
                    </div>
                    <div className='grid gap-4 p-4'>

                        {/* Kunden-Nr. */}
                        <div className='grid'>
                            <p className='text-sm font-semibold text-gray-600'>Ihre Kunden-Nr:</p>
                            <p className='text-md font-bold'>#34AD2CDV</p>
                        </div>
                        {/* Ansprechpartner */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-semibold text-gray-600'>Ihr Ansprechpartner:</label>
                            <div className='flex items-center justify-between hover:border-(--keepit-primary) hover:transition-all border border-gray-200 p-2 rounded-md'>
                                <div className='grid'>
                                    <p className='font-semibold'>Herr Oskar Sammet</p>
                                    <p className='text-sm text-gray-500'>oskar.sammet@dignum.de</p>
                                </div>
                                <Button size='sm' variant='ghost' iconOnly icon={
                                    <Pen className='size-4' />
                                } />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
