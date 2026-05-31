import { api } from "@/lib/api-client";

import type { Order } from "@/types";

export const getOrdersAction = () =>
  api<Order[]>("/api/orders", { method: "GET" });

export const createOrderAction = (offerId: string) =>
  api<Order>('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: offerId })
  });

export const deleteOrderAction = (id: string) =>
  api<void>(`/api/orders/${id}`, { method: "DELETE" });

export const generateOrderDocumentAction = (orderId: string) =>
  api<{ taskId: string }>(`/api/orders/${orderId}/document`, { method: "POST" });
