import { api } from "@/lib/api-client";

import type {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
} from "@/types";

export const getSuppliersAction = () =>
  api<Supplier[]>("/api/suppliers", { method: "GET" });

export const createSupplierAction = (supplier: CreateSupplierInput) =>
  api<Supplier>("/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...supplier }),
  });

export const UpdateSupplierAction = (supplierId: string, data: UpdateSupplierInput) =>
  api<Supplier>(`/api/suppliers/${supplierId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data }),
  });

export const deleteSupplierAction = (id: string) =>
  api<void>(`/api/suppliers/${id}`, { method: "DELETE" });
