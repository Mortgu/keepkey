import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product/product-item";
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

export async function removeFromShoppingCartAction(shoppingCartItemId: string) {
    const response = await fetch(`http://localhost:3000/api/cart`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ id: shoppingCartItemId }),
    });

    if (!response.ok) {
        throw new Error("Failed to remove from shopping cart!", await response.json());
    }

    const result = await response.json();

    return result;
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