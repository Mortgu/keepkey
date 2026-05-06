import { api } from "@/lib/api-client";

import type { Order, Task } from "@/types";

export const getOrdersAction = () =>
  api<Order[]>("/api/orders", { method: "GET" });

export const deleteOrderAction = (id: string) =>
  api<void>(`/api/orders/${id}`, { method: "DELETE" });

export const getTasksAction = (orderId: string) =>
  api<Task[]>(`api/orders/${orderId}/documents`, { method: "DELETE" });
