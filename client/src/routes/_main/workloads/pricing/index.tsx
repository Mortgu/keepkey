import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/workloads/pricing/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/workloads/pricing/"!</div>
}
