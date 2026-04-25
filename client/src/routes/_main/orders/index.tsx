import { createFileRoute } from '@tanstack/react-router'
import OrderList from './-components/order-list'

export const Route = createFileRoute('/_main/orders/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <OrderList />
}
