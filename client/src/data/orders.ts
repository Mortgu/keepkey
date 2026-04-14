import type { ShoppingCartItem, DocumentJob } from "./types";

interface CreateOrderResponse {
    orderId: string;
    success: boolean;
}

export async function getAllOrdersAction() {
    const response = await fetch('http://localhost:3000/api/admin/orders', {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        return [];
    }

    return result;
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

export async function createCheckoutAction() {
    const response = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Checkout request failed.")
    }

    const result = await response.json();

    return window.location.assign(result.url);
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

export async function startGeneration(orderId: string) {
    const response = await fetch(`http://localhost:3000/api/checkout/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: orderId,
        }),
    });

    if (!response.ok) {
        return { job: null };
    }

    return await response.json();;
}