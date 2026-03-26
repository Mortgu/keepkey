import { createFileRoute } from '@tanstack/react-router'
import OrderList from './-components/order-list';

export const Route = createFileRoute('/user/_pathlessLayout/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <OrderList />
    </div>
  )
}
