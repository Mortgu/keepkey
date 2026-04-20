import type { Customer } from "./types";

export async function getAllCustomersAction(): Promise<Customer[]> {
    const response = await fetch('http://localhost:3000/api/customers', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function getCustomerByIdAction(id: string): Promise<Customer | null> {
    const response = await fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function createCustomerAction(body: Partial<Customer>) {
    const response = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message ?? 'Failed to create customer');
    }

    return result;
}

export async function updateCustomerByIdAction(id: string, body: Partial<Customer>) {
    const response = await fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message ?? 'Failed to update customer');
    }

    return result;
}

export async function deleteCustomerAction(id: string) {
    const response = await fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message ?? 'Failed to delete customer');
    }

    return result;
}
