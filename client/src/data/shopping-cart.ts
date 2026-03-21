type CheckoutProps = {
    userId: string;
    productId: string;
    quantity: number;
}

export async function updateShoppingCart({ userId, productId, quantity }: CheckoutProps) {
    const result = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ userId, productId, quantity }),
    });

    return await result.json();
}

export async function getShoppingCart() {
    const result = await fetch('http://localhost:3000/api/cart', {
        method: 'GET',
        credentials: 'include',
    });

    return await result.json();
}