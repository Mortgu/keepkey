import type { SupplierFilterParams } from "@keepit/schemas";

export const supplierKeys = {
    all: ["suppliers"] as const,
    lists: () => [...supplierKeys.all, "list"] as const,
    list: (filters: SupplierFilterParams = {}) => [...supplierKeys.lists(), filters] as const,
};
