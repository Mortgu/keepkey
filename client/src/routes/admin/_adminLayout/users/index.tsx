import UserList from '@/routes/admin/_adminLayout/users/-components/user-list';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_adminLayout/users/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <UserList />
    );
}
