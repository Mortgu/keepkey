import type { BaseSupplier, Supplier } from "./types";

export async function getSuppliers(): Promise<Supplier[]> {
    const response = await fetch('http://localhost:3000/api/suppliers', {
        method: "GET",
        credentials: 'include'
    });

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function createSupplier(supplier: BaseSupplier) {
    const response = await fetch('http://localhost:3000/api/suppliers', {
        method: "POST",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...supplier })
    });

    if (!response.ok) {
        throw new Error("Failed to create supplier!")
    }

    return await response.json();
}

export async function deleteSupplier(id: string) {
    const response = await fetch('http://localhost:3000/api/suppliers', {
        method: "DELETE",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        throw new Error("Failed to delete supplier!")
    }

    return true;
}