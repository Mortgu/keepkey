import { createFileRoute } from '@tanstack/react-router'
import ProductList from "@/routes/-components/product-list.tsx";

export const Route = createFileRoute('/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <div>
        <ProductList />
      </div>
  )
}
