import type { BaseFlatRate, FlatRate } from "./types";
import { api } from "@/lib/api-client.ts";

export const getFlatRatesAction = () =>
  api<FlatRate[]>("/api/flatrates", { method: "GET" });

export const createFlatRateAction = (flatRate: BaseFlatRate) =>
  api<FlatRate>("/api/flatrates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flatRate),
  });

export const updateFlatRateAction = (
  id: string,
  flatRate: Partial<BaseFlatRate>,
) =>
  api<FlatRate>("/api/flatrates", {
    method: `/api/flatrates/${id}`,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flatRate),
  });

export const deleteFlatRateAction = (id: string) =>
  api<void>(`/api/flatrates/${id}`, { method: "DELETE" });
