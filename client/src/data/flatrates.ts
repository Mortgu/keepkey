import type { FlatRateBase, FlatRate } from "./types";

export async function getFlatRatesAction(): Promise<FlatRate[]> {
    const response = await fetch('http://localhost:3000/api/flatrates', {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createFlatRateAction(flatrate: FlatRateBase): Promise<FlatRate> {
    const response = await fetch('http://localhost:3000/api/flatrates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flatrate),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function updateFlatRateAction(id: string, flatrate: Partial<FlatRateBase>): Promise<FlatRate> {
    const response = await fetch(`http://localhost:3000/api/flatrates/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flatrate),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function deleteFlatRateAction(id: string): Promise<void> {
    const response = await fetch(`http://localhost:3000/api/flatrates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}
