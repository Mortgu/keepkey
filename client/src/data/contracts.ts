export async function getAllContracts() {
    const response = await fetch("http://localhost:3000/api/contracts", {
        method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function createContract({ name }: { name: string }) {
    const response = await fetch("http://localhost:3000/api/contracts", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (!result.ok) {
        throw new Error(result.message);
    }

    return result;
}

export async function deleteContract({ id }: { id: string }) {
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
