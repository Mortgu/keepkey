import { createFileRoute } from '@tanstack/react-router'
import CustomerList from './-components/customer-list';

export const Route = createFileRoute('/_main/customers/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <CustomerList />
    );
}
