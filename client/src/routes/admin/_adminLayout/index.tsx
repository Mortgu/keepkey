import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_adminLayout/')({
    component: AdminIndexComponent,
})

function AdminIndexComponent() {
    return <div>Admin Dashboard</div>
}
