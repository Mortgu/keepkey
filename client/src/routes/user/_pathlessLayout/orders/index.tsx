import { createFileRoute } from '@tanstack/react-router'
import { useOrders } from "@/hooks/order.ts";

export const Route = createFileRoute('/user/_pathlessLayout/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orders } = useOrders();

  return (
    <div>Hello "/user/_pathlessLayout/orders/"!</div>
  )
}
