export async function getProducts() {
    const response = await fetch('http://localhost:3000/api/products', {
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
    const result = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    return await result.json();
}

export async function getProductPricing(id: string) {
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