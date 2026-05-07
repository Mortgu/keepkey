import { api } from "@/lib/api-client";

import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductPricing,
  CreateProductPricingInput,
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

export const createPricingAction = (
  productId: string,
  pricing: CreateProductPricingInput,
) =>
  api<ProductPricing>(`/api/pricing/${productId}`, {
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

export const getPrice = (productId: string, contractId: string, duration: number, quantity: number) =>
  api<number>(`/api/pricing?productId=${productId}&contractId=${contractId}&duration_months=${duration}&quantity=${quantity}`, {
    method: 'GET'
  });