import type { ShoppingCartItem, DocumentJob } from "./types";

interface CreateOrderResponse {
    orderId: string;
    success: boolean;
}

export async function getOrdersAction() {
    const response = await fetch('http://localhost:3000/api/orders', {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createOrderAction(products: ShoppingCartItem[]): Promise<CreateOrderResponse> {
    if (products.length === 0) {
        throw new Error("No products found.");
    }

    const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify([...products])
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function deleteOrderAction(orderId: string) {
    const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function getDocumentJobsAction(orderId: string): Promise<DocumentJob[]> {
    const response = await fetch(`http://localhost:3000/api/orders/${orderId}/documents`, {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}