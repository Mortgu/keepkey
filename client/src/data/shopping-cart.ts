import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item";
import { type ShoppingCartItem } from "./types";

type CheckoutProps = {
    userId: string;
    productId: string;
    quantity: number;
}


export async function getShoppingCart(): Promise<ShoppingCartItem[]> {
    const response = await fetch('http://localhost:3000/api/cart', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shopping cart from user!");
    }

    const result: ShoppingCartItem[] = await response.json();

    return result;
}

export async function addToShoppingCartAction(product: Partial<ProductItemProps>) {
    const response = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ ...product }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function removeFromShoppingCartAction(product: Partial<ShoppingCartItem>) {
    console.log(product)

    return product;
}

export async function updateShoppingCart({ userId, productId, quantity }: CheckoutProps) {
    const result = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ userId, productId, quantity }),
    });

    return await result.json();
}

export async function deleteShoppingCartAction(userId: string) {
    const response = await fetch(`http://localhost:3000/api/cart/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}