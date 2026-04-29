import { api } from "@/lib/api-client";
import type { BaseSupplier, Supplier } from "./types";

export const getSuppliersAction = () =>
  api<Supplier[]>("/api/suppliers", { method: "GET" });

export const createSupplierAction = (supplier: BaseSupplier) =>
  api<Supplier>("/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...supplier }),
  });

export const deleteSupplierAction = (id: string) =>
  api<void>(`/api/suppliers/${id}`, { method: "DELETE" });
