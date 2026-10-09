import { api } from "@/lib/api-client";
import { formatQueryString } from "@/lib/utils";
import type { CreateOrderInput, Order, OrderFilterParams, UpdateOrderInput } from "@keepit/schemas";

export type { CreateOrderInput, UpdateOrderInput };

export const getOrders = (filters: OrderFilterParams = {}) =>
    api<Array<Order>>(`/api/orders?${formatQueryString(filters)}`, { method: "GET" });

export const getOrderById = (id: string) =>
    api<Order>(`/api/orders/${id}`, { method: "GET" });

export const getNextOrderNumber = () =>
    api<{ orderId: string }>("/api/orders/next-number", { method: "GET" });

export const createOrder = (input: CreateOrderInput) =>
    api<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
            id: input.id,
            expectedOfferVersion: input.expectedOfferVersion,
            orderId: input.orderId,
            date: input.date,
            projectNumber: input.projectNumber,
            projectDescription: input.projectDescription,
            orderDetails: input.orderDetails,
            contractStartDate: input.contractStartDate,
            positions: input.positions,
        }),
    });

export const cancelOrder = (id: string, expectedVersion: number) =>
    api<Order>(`/api/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({ expectedVersion }) });

export const updateOrder = (orderId: string, input: UpdateOrderInput) =>
    api<Order>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

export const generateOrderDocument = (orderId: string) =>
    api<{ taskId: string }>(`/api/orders/${orderId}/documents`, { method: "POST" });
