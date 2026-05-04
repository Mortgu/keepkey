import { api } from "@/lib/api-client.ts";

import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
} from "@/types";

export const getContractsAction = () =>
  api<Contract[]>("/api/contracts", { method: "GET" });

export const createContractAction = (data: CreateContractInput) =>
  api<Contract>("/api/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateContractAction = (id: string, data: UpdateContractInput) =>
  api<Contract>(`/api/contracts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteContractAction = (id: string) =>
  api<void>(`/api/contracts/${id}`, {
    method: "DELETE",
  });
