import { createFileRoute } from '@tanstack/react-router'
import OrderList from './-components/order-list'

export const Route = createFileRoute('/admin/_adminLayout/orders/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <OrderList />
}
