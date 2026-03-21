import {createFileRoute} from '@tanstack/react-router'
import {useCart} from "@/context/shopping-cart.tsx";
import {useCheckout} from "@/hooks/checkout.ts";

export const Route = createFileRoute('/checkout/')({
    component: RouteComponent,
})

function RouteComponent() {
    const {items, totalPrice} = useCart();
    const {mutate, isPending} = useCheckout();


    return (
        <div>
            {items.map(item => (
                <div>{item.name} {item.quantity}</div>
            ))}
        </div>
    )
}
