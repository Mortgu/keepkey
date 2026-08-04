import type { Order } from "@keepit/schemas";
import { api } from "@/lib/api-client";

export const restoreOrderRevisionAction = (
  orderId: string,
  revisionId: string,
  expectedVersion: number,
) => api<Order>(`/api/orders/${orderId}/revisions/${revisionId}/restore`, {
  method: "POST",
  body: JSON.stringify({ expectedVersion }),
});
