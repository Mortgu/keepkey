import type { components } from "./api";

export type Supplier = components["schemas"]["Supplier"];

export type CreateSupplierInput = Omit<Supplier, "id" | "createdAt" | "updatedAt" | "offers" | "orders">;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;
