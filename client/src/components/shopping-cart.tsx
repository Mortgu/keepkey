import {useCart} from "@/context/shopping-cart.tsx";
import {useCheckout} from "@/hooks/checkout.ts";
import {ShoppingBag} from "lucide-react";

export default function ShoppingCart() {
    const { items, totalPrice } = useCart();
    const { mutate, isPending } = useCheckout();

    return (
        <div className='m-auto'>
            <ShoppingBag className="size-6"/>
        </div>
    )
}