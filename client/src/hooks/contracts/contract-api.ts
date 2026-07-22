import { api } from "@/lib/api-client";
import type {
    Contract,
    CreateContractInput,
    UpdateContractInput
} from "@/types";

export const getContracts = () =>
    api<Array<Contract>>("/api/contracts", {
        method: "GET"
    });

export const getContract = (id: string) =>
    api<Contract>(`/api/contracts/${id}`, { method: "GET" });

export const createContract = (input: CreateContractInput) =>
    api<Contract>("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const updateContract = (id: string, input: UpdateContractInput) =>
    api<Contract>(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteContract = (id: string) =>
    api<void>(`/api/contracts/${id}`, {
        method: "DELETE",
    });
