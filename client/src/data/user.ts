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