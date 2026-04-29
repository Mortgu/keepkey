import type { BaseContract, Contract } from "./types";
import { api } from "@/lib/api-client.ts";

export const getContractsAction = () =>
  api<Contract[]>("/api/contracts", { method: "GET" });

export const createContractAction = (data: BaseContract) =>
  api<Contract>("/api/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateContractAction = (id: string, data: BaseContract) =>
  api<Contract>(`/api/contracts/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteContractAction = (id: string) =>
  api<void>(`http://localhost:3000/api/contracts/${id}`, {
    method: "DELETE",
  });
