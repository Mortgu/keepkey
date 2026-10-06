import type { CreateInvoiceInput, Invoice, InvoiceFilterParams, InvoiceListItem, Task } from "@keepit/schemas";
import { api } from "@/lib/api-client";
import { formatQueryString } from "@/lib/utils";

export const getInvoiceByOrder = (orderId: string) =>
    api<Invoice | null>(`/api/orders/${orderId}/invoice`, { method: "GET" });

export const createInvoice = (orderId: string, input: CreateInvoiceInput) =>
    api<Invoice>(`/api/orders/${orderId}/invoice`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export const regenerateInvoice = (orderId: string) =>
    api<Task>(`/api/orders/${orderId}/invoice/documents`, { method: "POST" });

export const getInvoices = (filters: InvoiceFilterParams = {}) =>
    api<Array<InvoiceListItem>>(`/api/invoices?${formatQueryString(filters)}`, { method: "GET" });
