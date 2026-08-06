import type {
    CreateSupplierInput,
    Supplier,
    SupplierFilterParams,
    UpdateSupplierInput,
} from '@keepit/schemas';
import { api } from "@/lib/api-client";
import { formatQueryString } from '@/lib/utils';


export const getSuppliers = (filters: SupplierFilterParams) =>
    api<Array<Supplier>>(`/api/suppliers?${formatQueryString(filters)}`, { method: "GET" });

export const createSupplier = (supplier: CreateSupplierInput) =>
    api<Supplier>("/api/suppliers", {
        method: "POST",
        body: JSON.stringify(supplier),
    });

export const updateSupplier = (id: string, supplier: UpdateSupplierInput) =>
    api<Supplier>(`/api/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(supplier),
    });

export const deleteSupplier = (id: string) =>
    api<void>(`/api/suppliers/${id}`, { method: "DELETE" });
