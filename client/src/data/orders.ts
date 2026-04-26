import type { DocumentJob } from "./types";



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
