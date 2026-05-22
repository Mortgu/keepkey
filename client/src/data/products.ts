import { api } from "@/lib/api-client";

import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types";

export const getProductsAction = () =>
  api<Product[]>("/api/products", { method: "GET" });

export const getProductAction = (id: string) =>
  api<Product>(`/api/products/${id}`, { method: "GET" });

export const createProductAction = (product: CreateProductInput) =>
  api<Product>("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...product }),
  });

export const updateProductAction = (id: string, product: UpdateProductInput) =>
  api<Product>(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

export const deleteProductAction = (id: string) =>
  api<void>(`/api/products/${id}`, { method: "DELETE" });

export { getTariffPrice as getPrice } from "./tariffs";
