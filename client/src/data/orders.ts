import { api } from "@/lib/api-client";
import type { DocumentJob, Order } from "./types";

export const getOrdersAction = () =>
  api<Order[]>("/api/orders", { method: "GET" });

export const deleteOrderAction = (id: string) =>
  api<void>(`/api/orders/${id}`, { method: "DELETE" });

export const getDocumentJobsAction = (orderId: string) =>
  api<DocumentJob[]>(`api/orders/${orderId}/documents`, { method: "DELETE" });
