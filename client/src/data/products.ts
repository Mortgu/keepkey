export async function getProducts() {
    const result = await fetch('http://localhost:3000/api/products', {
        method: 'GET',
        credentials: 'include',
    });

    const response = await result.json();

    if (!result.ok) {
        throw new Error(response.message);
    }

    return response;
}

export async function getProduct(id: string) {
    const result = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    return await result.json();
}