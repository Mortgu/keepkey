import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/_pathlessLayout/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/_pathlessLayout/orders/"!</div>
}
