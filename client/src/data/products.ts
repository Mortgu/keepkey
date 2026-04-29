import { api } from "@/lib/api-client";
import type { CreatePricingProps, Product } from "./types";

export const getProductsAction = () =>
  api<Product[]>("/api/products", { method: "GET" });

export const getProductAction = (id: string) =>
  api<Product>(`/api/products/${id}`, { method: "GET" });

export const createProductAction = (product: {
  name: string;
  description: string;
  table: string;
}) =>
  api<Product>("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...product }),
  });

export const createPricingAction = ({
  productId,
  pricing,
}: CreatePricingProps) =>
  api<Product>(`/api/pricing/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...pricing }),
  });

export const deleteProductAction = (id: string) =>
  api<void>(`/api/products/${id}`, { method: "DELETE" });

export const deletePricingAction = (id: string) =>
  api<void>(`/api/pricing/${id}`, { method: "DELETE" });

export const updateProductAction = (id: string, product: Partial<Product>) =>
  api<Product>(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
