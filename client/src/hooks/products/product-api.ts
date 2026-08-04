import type {
    CreateProductInput,
    Product,

    UpdateProductInput,
} from "@keepit/schemas";
import { api } from "@/lib/api-client";


export const getProducts = () =>
    api<Array<Product>>("/api/products", { method: "GET" });

export const getProduct = (id: string) =>
    api<Product>(`/api/products/${id}`, { method: "GET" });

export const createProduct = (product: CreateProductInput) =>
    api<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(product),
    });

export const updateProduct = (id: string, product: UpdateProductInput) =>
    api<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
    });

export const deleteProduct = (id: string) =>
    api<void>(`/api/products/${id}`, { method: "DELETE" });
