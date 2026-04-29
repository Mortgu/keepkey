import type { CreatePricingProps, Product } from "./types";

export async function getAllProducts() {
    const response = await fetch(`http://localhost:3000/api/admin/products`, {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function getProducts() {
    const response = await fetch(`http://localhost:3000/api/products`, {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function getProduct(id: string) {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createProductAction(product: {
    name: string, description: string, table: string,
}): Promise<Product> {
    const response = await fetch('http://localhost:3000/api/products', {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...product
        })
    })

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createPricingAction({ productId, pricing }: CreatePricingProps) {
    const response = await fetch(`http://localhost:3000/api/pricing/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...pricing })
    });

    if (!response.ok) {
        throw new Error("Failed to create new pricing!");
    }

    return await response.json();
}

export async function deleteProductAction(id: string): Promise<void> {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function deletePricingAction(id: string) {
    const response = await fetch(`http://localhost:3000/api/pricing/${id}`, {
        method: "DELETE",
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateProductAction(id: string, product: Partial<Product>) {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...product })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}