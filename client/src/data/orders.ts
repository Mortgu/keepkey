import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item";

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

export async function createOrderAction(products: ProductItemProps[]): Promise<ProductItemProps> {
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