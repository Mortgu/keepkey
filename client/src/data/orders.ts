import type { Order } from "@/types";
import { api } from "@/lib/api-client";


export const getOrdersAction = () =>
  api<Array<Order>>("/api/orders", { method: "GET" });

export const getNextOrderNumberAction = () =>
  api<{ orderId: string }>("/api/orders/next-number", { method: "GET" });

export type CreateOrderInput = {
  offerId: string;
  orderId: string;
  date?: string;
  projectNumber?: string;
  projectDescription?: string;
  orderDetails?: string;
};

export const createOrderAction = (input: CreateOrderInput) =>
  api<Order>('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: input.offerId,
      orderId: input.orderId,
      date: input.date,
      projectNumber: input.projectNumber,
      projectDescription: input.projectDescription,
      orderDetails: input.orderDetails,
    })
  });

export const deleteOrderAction = (id: string) =>
  api<void>(`/api/orders/${id}`, { method: "DELETE" });

export const generateOrderDocumentAction = (orderId: string) =>
  api<{ taskId: string }>(`/api/orders/${orderId}/document`, { method: "POST" });
