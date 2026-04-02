export async function getCurrentUser() {
    const response = await fetch('http://localhost:3000/api/users/session', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function getAllUsersAction() {
    const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function upsertAddress(data: { street: string; plz: string; city: string; phone?: string }) {
    const response = await fetch('http://localhost:3000/api/users/me/address', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to save address');
    }

    return await response.json();
}

export async function createContactPersons(data: Array<{ salutation: string; firstName: string; lastName: string; email?: string }>) {
    const response = await fetch('http://localhost:3000/api/users/me/contact-persons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create contact persons');
    }

    return await response.json();
}