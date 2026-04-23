import type { BaseContract, Contract } from "./types";

export async function getContractsAction(): Promise<Contract[]> {
    const response = await fetch("http://localhost:3000/api/contracts", {
        method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createContractAction(data: BaseContract): Promise<Contract> {
    const response = await fetch("http://localhost:3000/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateContractAction(id: string, data: BaseContract): Promise<Contract> {
    const response = await fetch(`http://localhost:3000/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function deleteContractAction(id: string) {
    const response = await fetch("http://localhost:3000/api/contracts", {
        method: "DELETE",
        credentials: "include",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}
