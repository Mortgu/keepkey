import { createFileRoute } from '@tanstack/react-router'
import UserList from './-components/user-list';

export const Route = createFileRoute('/_main/employees/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <UserList />
    );
}
