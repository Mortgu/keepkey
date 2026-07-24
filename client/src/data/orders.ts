import type { Order } from "@/types";
import { api } from "@/lib/api-client";

export const restoreOrderRevisionAction = (
  orderId: string,
  revisionId: string,
  expectedVersion: number,
) => api<Order>(`/api/orders/${orderId}/revisions/${revisionId}/restore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ expectedVersion }),
});
