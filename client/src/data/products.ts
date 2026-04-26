import type { ProductItemProps } from "@/routes/_main/products/-components/product-item";

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
    name: string, description: string, link: string,
}): Promise<ProductItemProps> {
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

export async function updateProductAction(id: string, product: Partial<ProductItemProps>) {
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