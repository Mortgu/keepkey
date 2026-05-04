import { api } from "@/lib/api-client.ts";

import type {
  FlatRate,
  CreateFlatRateInput,
  UpdateFlatRateInput,
} from '@/types';

export const getFlatRatesAction = () =>
  api<FlatRate[]>("/api/flatrates", { method: "GET" });

export const createFlatRateAction = (flatRate: CreateFlatRateInput) =>
  api<FlatRate>("/api/flatrates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flatRate),
  });

export const updateFlatRateAction = (
  id: string,
  flatRate: Partial<UpdateFlatRateInput>,
) =>
  api<FlatRate>(`/api/flatrates/${id}`, {
    method: `PUT`,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flatRate),
  });

export const deleteFlatRateAction = (id: string) =>
  api<void>(`/api/flatrates/${id}`, { method: "DELETE" });
