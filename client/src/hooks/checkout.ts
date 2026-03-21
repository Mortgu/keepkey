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

export const useAddToCart = () => {
    return useMutation({
        mutationFn: async (cartItem: CartItem) => {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {'Accept': 'application/json','Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify({ ...cartItem }),
            });

            return await response.json();
        },
        onSuccess: () => {
            console.log("Cart updated!");
        }
    })
}