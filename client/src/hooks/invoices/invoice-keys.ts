import type { InvoiceFilterParams } from "@keepit/schemas";

export const invoiceKeys = {
    all: ["invoices"] as const,
    byOrder: (orderId: string) => [...invoiceKeys.all, "order", orderId] as const,
    lists: () => [...invoiceKeys.all, "list"] as const,
    list: (filters: InvoiceFilterParams = {}) => [...invoiceKeys.lists(), filters] as const,
};
