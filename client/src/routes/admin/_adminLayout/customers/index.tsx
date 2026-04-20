import CustomerList from '@/routes/admin/_adminLayout/customers/-components/customer-list';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_adminLayout/customers/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <CustomerList />
    );
}
