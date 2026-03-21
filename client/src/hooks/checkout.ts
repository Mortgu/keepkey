import {useMutation} from "@tanstack/react-query";
import type {CartItem} from "@/context/shopping-cart.tsx";

export const useCheckout = () => {
    return useMutation({
        mutationFn: async (cartItem: CartItem[]) => {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                credentials: "include",
                body: JSON.stringify({ items: cartItem }),
            });

            return response.json();
        },
        onSuccess: () => {
            console.log("Checkout success!");
        }
    })
}