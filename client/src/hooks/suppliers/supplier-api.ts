import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from "@/types";
import { api } from "@/lib/api-client";

export const getSuppliers = () =>
    api<Array<Supplier>>("/api/suppliers", { method: "GET" });

export const createSupplier = (supplier: CreateSupplierInput) =>
    api<Supplier>("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
    });

export const updateSupplier = (id: string, supplier: UpdateSupplierInput) =>
    api<Supplier>(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
    });

export const deleteSupplier = (id: string) =>
    api<void>(`/api/suppliers/${id}`, { method: "DELETE" });
