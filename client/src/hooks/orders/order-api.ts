import type { Order, OrderRevision } from "@/types";
import { api } from "@/lib/api-client";

export type CreateOrderInput = {
    offerId: string;
    orderId: string;
    date?: string;
    projectNumber?: string;
    projectDescription?: string;
    orderDetails?: string;
};

export type UpdateOrderInput = {
    expectedVersion: number;
    order: {
        supplierId: string | null;
        customerId: string;
        contactPersonId: string;
        employeeId: string;
        orderId: string;
        paymentTerm: string;
        projectNumber: string | null;
        projectDescription: string | null;
        orderDetails: string | null;
        date: string;
        validUntil: string | null;
        requestFrom: string | null;
    };
    positions: Array<{
        productId: string;
        contractId: string;
        duration_months: number;
        quantity: number;
        optional: boolean | null;
        total_cents: number;
    }>;
    flatRates: Array<{
        flatRateId: string;
        quantity: number;
        total_cents: number;
    }>;
};

export const getOrders = () =>
    api<Array<Order>>("/api/orders", { method: "GET" });

export const getNextOrderNumber = () =>
    api<{ orderId: string }>("/api/orders/next-number", { method: "GET" });

export const createOrder = (input: CreateOrderInput) =>
    api<Order>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: input.offerId,
            orderId: input.orderId,
            date: input.date,
            projectNumber: input.projectNumber,
            projectDescription: input.projectDescription,
            orderDetails: input.orderDetails,
        }),
    });

export const deleteOrder = (id: string) =>
    api<void>(`/api/orders/${id}`, { method: "DELETE" });

export const updateOrder = (orderId: string, input: UpdateOrderInput) =>
    api<Order>(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const generateOrderDocument = (orderId: string) =>
    api<{ taskId: string }>(`/api/orders/${orderId}/documents`, { method: "POST" });

export const getOrderRevisions = (orderId: string) =>
    api<Array<OrderRevision>>(`/api/orders/${orderId}/revisions`, { method: "GET" });

export const restoreOrderRevision = (orderId: string, revisionId: string, expectedVersion: number) =>
    api<Order>(`/api/orders/${orderId}/revisions/${revisionId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion }),
    });
