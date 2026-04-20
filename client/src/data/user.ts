import type { ContactPerson, User } from "./types";

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

export async function getAllContactPersons(userId: string): Promise<ContactPerson[]> {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    const user: User = await response.json();

    return user.customer?.contactPersons ?? [];
}

export async function getAllUsersAction() {
    const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    const result = await response.json();
    return result;
}

/* Update user */
export async function updateUserByIdAction(id: string, body: Partial<User>) {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...body })
    });

    if (!response.ok) {
        return [];
    }

    const result = await response.json();
    return result;
}

/* Create new user */
export async function createUserAction(body: Partial<User>) {
    const response = await fetch(`http://localhost:3000/api/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...body })
    });

    if (!response.ok) {
        return [];
    }

    const result = await response.json();
    return result;
}

export async function deleteUserAction(id: string) {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    const result = await response.json();
    return result;
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

export async function deleteAccountAction() {
    const response = await fetch('http://localhost:3000/api/users', {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to create contact persons');
    }

    return await response.json();
}