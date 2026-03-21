
export async function getCurrentUser() {
    const user = await fetch('http://localhost:3000/api/users/current', {
        method: 'GET',
        credentials: 'include',
    });

    if (!user) {
        return null;
    }

    return await user.json();
}
